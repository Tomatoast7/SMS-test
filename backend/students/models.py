from django.db import models

class Student(models.Model):
    student_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField()
    address = models.TextField(blank=True)
    enrollment_date = models.DateField(auto_now_add=True)
    
    class Meta:
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.student_id} - {self.first_name} {self.last_name}"

class Subject(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    credits = models.IntegerField(default=3)
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    enrollment_date = models.DateField(auto_now_add=True)
    
    class Meta:
        unique_together = ['student', 'subject']
    
    def __str__(self):
        return f"{self.student.student_id} - {self.subject.code}"

class Grade(models.Model):
    GRADE_TYPES = [
        ('activity', 'Activity'),
        ('quiz', 'Quiz'),
        ('exam', 'Exam'),
    ]
    
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='grades')
    grade_type = models.CharField(max_length=10, choices=GRADE_TYPES)
    title = models.CharField(max_length=100)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    max_score = models.DecimalField(max_digits=5, decimal_places=2)
    date_recorded = models.DateField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date_recorded']
    
    def __str__(self):
        return f"{self.enrollment} - {self.title}: {self.score}/{self.max_score}"
    
    @property
    def percentage(self):
        if self.max_score > 0:
            return round((self.score / self.max_score) * 100, 2)
        return 0
