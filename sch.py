import os
import uvicorn
import requests
import pprint
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware

# --- 1. Load Environment Variables ---
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
CALENDLY_API_KEY = os.getenv("CALENDLY_API_KEY")
CALENDLY_EVENT_TYPE_URL = os.getenv("CALENDLY_EVENT_TYPE_URL") # e.g., https://api.calendly.com/event_types/AABBC...

if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY not found in .env")
if not CALENDLY_API_KEY:
    raise ValueError("❌ CALENDLY_API_KEY not found in .env")
if not CALENDLY_EVENT_TYPE_URL:
    raise ValueError("❌ CALENDLY_EVENT_TYPE_URL not found in .env")
    
# --- 2. Initialize LLM ---
print("--- 🧠 Initializing Log Analysis LLM ---")
llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)
print("--- ✅ LLM Ready ---")


# --- 3. Pydantic Models ---

# This is the expected input from your frontend
class CallLogRequest(BaseModel):
    callId: str
    logs: Dict[str, Any]
    timestamp: str

# This is what we want the LLM to extract from the log
class MeetingAnalysis(BaseModel):
    meeting_scheduled: bool = Field(description="Was a meeting successfully scheduled and confirmed by the user?")
    time: Optional[str] = Field(description="The confirmed date and time of the meeting in 'YYYY-MM-DDTHH:MM:SS' format. Use today's date if only a time is given.")
    name: Optional[str] = Field(description="The user's full name.")
    email: Optional[str] = Field(description="The user's email address.")

# --- 4. LLM Analysis Chain ---
log_analysis_parser = PydanticOutputParser(pydantic_object=MeetingAnalysis)

log_analysis_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are an expert log analyst. Your job is to read a call transcript and determine if a meeting was successfully scheduled. "
        "The user MUST have confirmed a specific time and provided at least an email. "
        f"Today's date is {datetime.now().isoformat()}. "
        "If they say 'tomorrow at 2pm', calculate that date. "
        "Respond ONLY with the required JSON object."
        "\n\n{format_instructions}"
    ),
    (
        "human",
        "Here is the call transcript:\n{transcript}\n\n"
        "Please analyze the transcript and extract the meeting details. "
        "If no meeting was confirmed, or if name/email is missing, set 'meeting_scheduled' to false."
    ),
]).partial(format_instructions=log_analysis_parser.get_format_instructions())

log_analysis_chain = log_analysis_prompt | llm | log_analysis_parser
print("--- ✅ Log Analysis Chain Created ---")

# --- 5. Calendly API Function ---
def get_available_times(start_time: str, end_time: str) -> Optional[list]:
    """
    Fetches available time slots from Calendly for the given date range.
    """
    headers = {
        "Authorization": f"Bearer {CALENDLY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Get the event type URI from the URL
    event_type_uri = CALENDLY_EVENT_TYPE_URL
    
    try:
        # Calendly API to get available times
        params = {
            "event_type": event_type_uri,
            "start_time": start_time,
            "end_time": end_time
        }
        
        response = requests.get(
            "https://api.calendly.com/event_type_available_times",
            headers=headers,
            params=params
        )
        response.raise_for_status()
        data = response.json()
        
        available_times = data.get("collection", [])
        return available_times if available_times else None
        
    except requests.exceptions.RequestException as e:
        print(f"--- ❌ Error fetching available times: {e} ---")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None


def schedule_calendly_meeting(name: str, email: str, start_time: str) -> Dict[str, Any]:
    """
    Schedules a meeting in Calendly by:
    1. Finding available slots near the requested time
    2. Creating a scheduling link for the invitee
    """
    print(f"--- 📅 Attempting to book Calendly meeting for {email} around {start_time} ---")
    
    headers = {
        "Authorization": f"Bearer {CALENDLY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Parse and validate the requested time
    try:
        requested_time = datetime.fromisoformat(start_time)
        # Search for slots within a 3-hour window around the requested time
        search_start = requested_time - timedelta(hours=1)
        search_end = requested_time + timedelta(hours=2)
    except Exception:
        # Fallback if LLM gives a bad time - schedule for tomorrow
        requested_time = datetime.now() + timedelta(days=1)
        search_start = requested_time
        search_end = requested_time + timedelta(hours=3)
    
    # Format times for Calendly API (ISO 8601 with timezone)
    search_start_iso = search_start.isoformat()
    search_end_iso = search_end.isoformat()
    
    print(f"--- 🔍 Searching for available slots between {search_start_iso} and {search_end_iso} ---")
    
    # Step 1: Get available times
    available_times = get_available_times(search_start_iso, search_end_iso)
    
    if not available_times:
        print("--- ⚠️ No available times found. Creating a scheduling link instead. ---")
        # Fallback: Create a one-off scheduling link
        try:
            scheduling_link_payload = {
                "max_event_count": 1,
                "owner": CALENDLY_EVENT_TYPE_URL.split('/event_types/')[0].replace('/event_types', '/users'),
                "owner_type": "EventType"
            }
            
            response = requests.post(
                "https://api.calendly.com/scheduling_links",
                headers=headers,
                json=scheduling_link_payload
            )
            response.raise_for_status()
            link_data = response.json()
            
            scheduling_url = link_data.get("resource", {}).get("booking_url", "")
            print(f"--- ✅ Created scheduling link: {scheduling_url} ---")
            
            return {
                "status": "link_created",
                "details": {
                    "scheduling_url": scheduling_url,
                    "message": f"Please share this link with {name} ({email}) to complete booking."
                }
            }
            
        except requests.exceptions.RequestException as e:
            print(f"--- ❌ CALENDLY ERROR creating scheduling link: {e} ---")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.text}")
            return {"status": "failed", "error": str(e)}
    
    # Step 2: Book the first available slot
    try:
        first_slot = available_times[0]
        slot_start = first_slot.get("start_time")
        
        print(f"--- 📅 Booking slot at {slot_start} ---")
        
        # Create invitee booking
        invitee_payload = {
            "event": {
                "event_type": CALENDLY_EVENT_TYPE_URL,
                "start_time": slot_start
            },
            "invitee": {
                "email": email,
                "name": name
            }
        }
        
        response = requests.post(
            "https://api.calendly.com/scheduled_events",
            headers=headers,
            json=invitee_payload
        )
        response.raise_for_status()
        booking_data = response.json()
        
        scheduled_event = booking_data.get("resource", {})
        print("--- ✅ Calendly meeting scheduled successfully. ---")
        print(f"Event URI: {scheduled_event.get('uri', 'N/A')}")
        
        return {
            "status": "scheduled",
            "details": {
                "event_uri": scheduled_event.get("uri"),
                "start_time": scheduled_event.get("start_time"),
                "end_time": scheduled_event.get("end_time"),
                "invitee_email": email,
                "invitee_name": name
            }
        }
    
    except requests.exceptions.RequestException as e:
        print(f"--- ❌ CALENDLY ERROR scheduling meeting: {e} ---")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return {"status": "failed", "error": str(e)}

# --- 6. Create the FastAPI App ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Call Log Analysis Server is running."}

@app.post("/call-logs")
async def handle_call_logs(request: CallLogRequest, background_tasks: BackgroundTasks):
    """
    Receives call logs from the frontend, analyzes them, and
    schedules a meeting if one was booked.
    """
    print(f"--- 🪵 Received logs for Call ID: {request.callId} ---")
    
    try:
        # Format the transcript for the LLM
        transcript_msgs = request.logs.get("transcript", [])
        if not transcript_msgs:
            print("--- ⚠️ No transcript found in logs. ---")
            return {"status": "error", "message": "No transcript to analyze."}
            
        transcript_text = "\n".join(
            [f"{msg['role']}: {msg['transcript']}" for msg in transcript_msgs if 'transcript' in msg]
        )
        
        print("--- 🧠 Analyzing transcript... ---")
        # Call the LLM to analyze the transcript
        analysis = await log_analysis_chain.ainvoke({"transcript": transcript_text})
        
        if analysis.meeting_scheduled and analysis.email and analysis.name and analysis.time:
            print("--- ✅ Meeting detected! Booking in background... ---")
            # Schedule the meeting in the background
            background_tasks.add_task(
                schedule_calendly_meeting,
                analysis.name,
                analysis.email,
                analysis.time
            )
            return {"status": "meeting_booking_started", "details": analysis.model_dump()}
        else:
            print("--- ℹ️ No meeting was scheduled in this call. ---")
            return {"status": "no_meeting_detected", "details": analysis.model_dump()}

    except Exception as e:
        print(f"--- ❌ Log Analysis ERROR: {e} ---")
        raise HTTPException(status_code=500, detail="Failed to analyze call logs.")


if __name__ == "__main__":
    print("--- 🚀 Starting Log Analysis Server on http://localhost:8004 ---")
    uvicorn.run(app, host="0.0.0.0", port=8004)