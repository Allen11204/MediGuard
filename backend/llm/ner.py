import re
from backend.utils.log import log

# HIPAA PHI patterns
SSN_PATTERN   = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
PHONE_PATTERN = re.compile(r'\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b')
EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')


def input_filter(text: str) -> tuple:
    """
    Check user input for PHI before sending to LLM.
    Returns (text, None) if safe, or (None, error_message) if PHI detected.
    """
    if SSN_PATTERN.search(text):
        log("NER", "input blocked: SSN detected")
        return None, "Please do not share sensitive information like SSN in the chat."
    if PHONE_PATTERN.search(text):
        log("NER", "input blocked: phone number detected")
        return None, "Please do not share sensitive information like phone numbers in the chat."
    if EMAIL_PATTERN.search(text):
        log("NER", "input blocked: email detected")
        return None, "Please do not share sensitive information like email addresses in the chat."
    log("NER", "input passed")
    return text, None


def deidentify(text: str) -> str:
    """
    Replace PHI patterns in text with [REDACTED].
    Used on tool query results (before feeding to LLM) and LLM output (before returning to frontend).
    """
    redacted = []
    if SSN_PATTERN.search(text):
        redacted.append("SSN")
    if PHONE_PATTERN.search(text):
        redacted.append("phone")
    if EMAIL_PATTERN.search(text):
        redacted.append("email")

    if redacted:
        log("NER", f"deidentify redacted: {', '.join(redacted)}")
    else:
        log("NER", "deidentify: nothing to redact")

    text = SSN_PATTERN.sub('[SSN REDACTED]', text)
    text = PHONE_PATTERN.sub('[PHONE REDACTED]', text)
    text = EMAIL_PATTERN.sub('[EMAIL REDACTED]', text)
    return text
