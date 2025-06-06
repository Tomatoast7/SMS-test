from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse
from django.views.static import serve
import os

# Get the path to your frontend directory
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'frontend')

def serve_frontend(request):
    """Serve the frontend index.html file"""
    index_file = os.path.join(FRONTEND_DIR, 'index.html')
    return FileResponse(open(index_file, 'rb'))

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('students.urls')),
    # Serve frontend index.html at the root URL
    path('', serve_frontend),
]

# Add static serving for frontend assets (js, css, etc.)
urlpatterns += [
    path('script.js', serve, {'document_root': FRONTEND_DIR, 'path': 'script.js'}),
    path('styles.css', serve, {'document_root': FRONTEND_DIR, 'path': 'styles.css'}),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
