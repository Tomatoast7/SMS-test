from rest_framework import serializers
from .models import Student, Subject, Enrollment, Grade

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class GradeSerializer(serializers.ModelSerializer):
    percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Grade
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    student_last_name = serializers.CharField(source='student.last_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    grades = GradeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Enrollment
        fields = '__all__'

class StudentDetailSerializer(serializers.ModelSerializer):
    enrollments = EnrollmentSerializer(source='enrollment_set', many=True, read_only=True)
    
    class Meta:
        model = Student
        fields = '__all__'
