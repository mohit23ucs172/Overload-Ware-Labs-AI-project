from loguru import logger
import sys
import os

# Configure loguru logger
log_level = os.getenv("LOG_LEVEL", "INFO")
log_format = "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"

# Remove default handler
logger.remove()

# Add console handler
logger.add(
    sys.stderr,
    format=log_format,
    level=log_level,
    colorize=True,
)

# Add file handler for errors and above
logger.add(
    "logs/error.log",
    format=log_format,
    level="ERROR",
    rotation="10 MB",
    retention="1 week",
)

# Add file handler for all logs
logger.add(
    "logs/app.log",
    format=log_format,
    level=log_level,
    rotation="10 MB",
    retention="3 days",
)

# Create logs directory if it doesn't exist
os.makedirs("logs", exist_ok=True)