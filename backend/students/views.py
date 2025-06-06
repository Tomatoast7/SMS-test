from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import Student, Subject, Enrollment, Grade
from .serializers import (
    StudentSerializer, SubjectSerializer, 
    EnrollmentSerializer, GradeSerializer,
    StudentDetailSerializer
)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StudentDetailSerializer
        return StudentSerializer
    
    @action(detail=True, methods=['get'])
    def subjects(self, request, pk=None):
        student = self.get_object()
        enrollments = Enrollment.objects.filter(student=student)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def grades(self, request, pk=None):
        student = self.get_object()
        grades = Grade.objects.filter(enrollment__student=student)
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    
    def get_queryset(self):
        queryset = Enrollment.objects.all()
        student_id = self.request.query_params.get('student_id', None)
        if student_id is not None:
            queryset = queryset.filter(student__id=student_id)
        return queryset

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    
    def get_queryset(self):
        queryset = Grade.objects.all()
        enrollment_id = self.request.query_params.get('enrollment_id', None)
        grade_type = self.request.query_params.get('grade_type', None)
        
        if enrollment_id is not None:
            queryset = queryset.filter(enrollment__id=enrollment_id)
        if grade_type is not None:
            queryset = queryset.filter(grade_type=grade_type)
            
        return queryset
