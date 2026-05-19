"""Phase 7 backend tests — Multi-admin chat: joined/closed system messages, close flow, message after close, fresh session."""
import os
import pytest
import requests
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")
load_dotenv("/app/frontend/.env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
ADMIN_TOKEN = "tuncel2026admin"
HDRS = {"X-Admin-Token": ADMIN_TOKEN, "Content-Type": "application/json"}


def _get_msgs(sid: str):
    r = requests.get(f"{BASE_URL}/api/chat/{sid}/messages")
    assert r.status_code == 200, r.text
    data = r.json()
    # endpoint returns {"session": {...}, "messages": [...]}
    if isinstance(data, dict) and "messages" in data:
        return data["messages"], data.get("session", {})
    return data, {}


@pytest.fixture(scope="module")
def session_id():
    """Start a fresh customer chat session."""
    r = requests.post(f"{BASE_URL}/api/chat/start", json={
        "customer_name": "TEST_P7 Customer",
        "customer_email": "TEST_p7@example.com",
        "initial_message": "Hello, Phase 7 test",
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert "session_id" in data
    return data["session_id"]


class TestMultiAdminJoined:
    def test_first_admin_reply_inserts_joined_sysmsg(self, session_id):
        # Eren's first reply
        r = requests.post(
            f"{BASE_URL}/api/admin/chat/{session_id}/reply",
            json={"body": "Hi, I'm Eren, how can I help?", "admin_name": "Eren"},
            headers=HDRS,
        )
        assert r.status_code == 200, r.text

        # Fetch messages
        msgs, _sess = _get_msgs(session_id)
        # Expect: customer initial, system 'Eren joined the chat', admin body
        senders = [(x.get("sender"), x.get("sender_name"), x.get("body")) for x in msgs]
        sys_msgs = [s for s in senders if s[0] == "system"]
        assert any("Eren joined the chat" in (s[2] or "") for s in sys_msgs), f"missing Eren joined sysmsg; got: {senders}"
        admin_msgs = [s for s in senders if s[0] == "admin"]
        assert any(s[1] == "Eren" and "Eren" in (s[2] or "") for s in admin_msgs)
        # system sender_name must be absent / None / empty
        for s in sys_msgs:
            assert not s[1], f"system msg has sender_name: {s}"

    def test_second_reply_same_admin_no_extra_joined(self, session_id):
        m_before, _ = _get_msgs(session_id)
        joined_before = sum(1 for x in m_before if x.get("sender") == "system" and "Eren joined" in (x.get("body") or ""))

        r = requests.post(
            f"{BASE_URL}/api/admin/chat/{session_id}/reply",
            json={"body": "Eren follow up", "admin_name": "Eren"},
            headers=HDRS,
        )
        assert r.status_code == 200, r.text

        m_after, _ = _get_msgs(session_id)
        joined_after = sum(1 for x in m_after if x.get("sender") == "system" and "Eren joined" in (x.get("body") or ""))
        assert joined_after == joined_before, "extra 'Eren joined' system message inserted on 2nd reply"

    def test_second_admin_emits_joined(self, session_id):
        r = requests.post(
            f"{BASE_URL}/api/admin/chat/{session_id}/reply",
            json={"body": "Ahmet here", "admin_name": "Ahmet"},
            headers=HDRS,
        )
        assert r.status_code == 200, r.text
        msgs, _ = _get_msgs(session_id)
        assert any(
            x.get("sender") == "system" and "Ahmet joined the chat" in (x.get("body") or "")
            for x in msgs
        ), "missing Ahmet joined sysmsg"


class TestAdminClose:
    def test_close_inserts_sysmsg_and_status(self, session_id):
        r = requests.put(
            f"{BASE_URL}/api/admin/chat/{session_id}/close",
            params={"admin_name": "Eren"},
            headers=HDRS,
        )
        assert r.status_code == 200, r.text

        msgs, sess = _get_msgs(session_id)
        assert sess.get("status") == "closed", f"session status not closed: {sess}"
        assert any(
            x.get("sender") == "system" and "Chat closed by Eren" in (x.get("body") or "")
            for x in msgs
        ), "missing 'Chat closed by Eren' sysmsg"

    def test_customer_message_after_close_400(self, session_id):
        r = requests.post(
            f"{BASE_URL}/api/chat/{session_id}/message",
            json={"body": "Hi, anyone?"},
        )
        assert r.status_code == 400, f"expected 400 after close, got {r.status_code}: {r.text}"
        # error mentions closed
        assert "closed" in r.text.lower()

    def test_start_new_session_allowed(self):
        # Brand new session — even with same email, should succeed and return a new session_id
        r = requests.post(f"{BASE_URL}/api/chat/start", json={
            "customer_name": "TEST_P7 Customer",
            "customer_email": "TEST_p7@example.com",
            "initial_message": "fresh start after close",
        })
        assert r.status_code == 200, r.text
        new_sid = r.json()["session_id"]
        assert new_sid and isinstance(new_sid, str)


class TestSystemMessageShape:
    def test_system_messages_have_no_sender_name(self, session_id):
        msgs, _ = _get_msgs(session_id)
        sys_msgs = [m for m in msgs if m.get("sender") == "system"]
        assert sys_msgs, "expected at least one system message in session"
        for s in sys_msgs:
            # sender_name should be absent or None / empty for system messages
            sn = s.get("sender_name")
            assert not sn, f"system message has sender_name set: {s}"

    def test_admin_messages_have_sender_name(self, session_id):
        msgs, _ = _get_msgs(session_id)
        admin_msgs = [m for m in msgs if m.get("sender") == "admin"]
        assert admin_msgs
        names = {m.get("sender_name") for m in admin_msgs}
        assert "Eren" in names or "Ahmet" in names, f"no expected admin names in {names}"
