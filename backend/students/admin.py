from django.contrib import admin
from .models import Student, Subject, Enrollment, Grade

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'first_name', 'last_name', 'email', 'enrollment_date']
    search_fields = ['student_id', 'first_name', 'last_name', 'email']
    list_filter = ['enrollment_date']

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'credits']
    search_fields = ['code', 'name']

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'subject', 'enrollment_date']
    list_filter = ['enrollment_date', 'subject']

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'grade_type', 'title', 'score', 'max_score', 'percentage']
    list_filter = ['grade_type', 'date_recorded']
    search_fields = ['title', 'enrollment__student__student_id']
