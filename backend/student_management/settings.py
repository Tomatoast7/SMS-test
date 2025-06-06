import os
from pathlib import Path
import os
import dj_database_url
from urllib.parse import urlparse # For robust URL parsing

BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET_KEY will be set by Render in the environment. Fallback for local development.
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-your-secret-key-here')

# DEBUG will be set to 'False' by Render in production.
# Default to True if DJANGO_DEBUG is not set (for local development).
DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = []
RENDER_EXTERNAL_URL = os.environ.get('RENDER_EXTERNAL_URL')
if RENDER_EXTERNAL_URL:
    parsed_render_url = urlparse(RENDER_EXTERNAL_URL)
    if parsed_render_url.hostname:
        ALLOWED_HOSTS.append(parsed_render_url.hostname)

# Allow localhost/127.0.0.1 for local development and Render health checks
ALLOWED_HOSTS.extend(['localhost', '127.0.0.1'])


# CSRF Configuration
CSRF_TRUSTED_ORIGINS = []
if RENDER_EXTERNAL_URL:
    CSRF_TRUSTED_ORIGINS.append(RENDER_EXTERNAL_URL) # RENDER_EXTERNAL_URL includes the scheme

if DEBUG: # For local HTTP development
    CSRF_TRUSTED_ORIGINS.extend(['http://localhost:8000', 'http://127.0.0.1:8000'])
else: # For production HTTPS (Render default)
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'students',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',  # Should be near the top
    'whitenoise.middleware.WhiteNoiseMiddleware',     # Add WhiteNoise for static files
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'student_management.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR.parent / "frontend"], # Points to the root 'frontend' directory for index.html
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'student_management.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(
        # Default to SQLite if DATABASE_URL is not set (for local development)
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600  # Recommended for persistent connections by Render
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR.parent / "frontend", # Points to the root 'frontend' directory
]
STATIC_ROOT = BASE_DIR / 'staticfiles'  # Directory where collectstatic will place files for production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage' # For WhiteNoise

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

CORS_ALLOW_CREDENTIALS = True # As per user's original setting

if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True # Allow all origins in development
else:
    # In production, specify allowed origins. RENDER_EXTERNAL_URL is defined at the top.
    CORS_ALLOWED_ORIGINS = []
    if RENDER_EXTERNAL_URL:
        CORS_ALLOWED_ORIGINS.append(RENDER_EXTERNAL_URL)
    # If CORS_ALLOWED_ORIGINS remains empty, Django's default (no CORS headers) applies.
