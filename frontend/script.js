let API_BASE_URL;

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  API_BASE_URL = "http://localhost:8000/api";
} else {
  // Use your actual deployed Render URL here
  API_BASE_URL = "https://sms-test-makigangay.onrender.com/api";
}

class StudentManagementSystem {
  constructor() {
    this.currentStudentId = null
    this.currentSubjectId = null
    this.currentGradeId = null
    this.enrollments = []
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadStudents()
    this.loadSubjects()
    this.loadEnrollments()
      .then(() => this.loadGrades())
      .catch(error => console.error("Failed to initialize properly:", error))
  }

  setupEventListeners() {
    // Sidebar Navigation
    document.getElementById("studentsNav").addEventListener("click", () => this.showSection("students"))
    document.getElementById("subjectsNav").addEventListener("click", () => this.showSection("subjects"))
    document.getElementById("gradesNav").addEventListener("click", () => this.showSection("grades"))
    document.getElementById("settingsNav").addEventListener("click", () => this.showSection("settings"))
    
    // Mobile sidebar toggle
    document.getElementById("sidebarToggle").addEventListener("click", () => this.toggleSidebar())

    // Student events
    document.getElementById("addStudentBtn").addEventListener("click", () => this.showStudentModal())
    document.getElementById("studentForm").addEventListener("submit", (e) => this.handleStudentSubmit(e))
    document.getElementById("cancelStudentBtn").addEventListener("click", () => this.hideStudentModal())
    document.getElementById("studentSearch").addEventListener("input", (e) => this.searchStudents(e.target.value))

    // Subject events
    document.getElementById("addSubjectBtn").addEventListener("click", () => this.showSubjectModal())
    document.getElementById("subjectForm").addEventListener("submit", (e) => this.handleSubjectSubmit(e))
    document.getElementById("cancelSubjectBtn").addEventListener("click", () => this.hideSubjectModal())
    document.getElementById("subjectSearch").addEventListener("input", (e) => this.searchSubjects(e.target.value))

    // Grade events
    document.getElementById("addGradeBtn").addEventListener("click", () => this.showGradeModal())
    document.getElementById("gradeForm").addEventListener("submit", (e) => this.handleGradeSubmit(e))
    document.getElementById("cancelGradeBtn").addEventListener("click", () => this.hideGradeModal())
    document.getElementById("studentFilter").addEventListener("change", () => this.filterGrades())
    document.getElementById("subjectFilter").addEventListener("change", () => this.filterGrades())
    document.getElementById("gradeTypeFilter").addEventListener("change", () => this.filterGrades())

    // Modal close events
    document.querySelectorAll(".close").forEach((closeBtn) => {
      closeBtn.addEventListener("click", (e) => {
        e.target.closest(".modal").style.display = "none"
      })
    })

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none"
      }
    })
  }

  showSection(section) {
    // Hide all sections
    document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"))
    
    // Remove active class from all nav links
    document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"))

    // Show the selected section
    document.getElementById(`${section}Section`).classList.add("active")
    
    // Set the active nav link
    document.getElementById(`${section}Nav`).classList.add("active")
    
    // Update the page title
    const pageTitle = document.getElementById("pageTitle")
    pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1)
  }
  
  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar')
    sidebar.classList.toggle('active')
  }

  async apiRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // For DELETE requests or 204 No Content responses, return an empty object
      if (options.method === 'DELETE' || response.status === 204) {
        return {}
      }
      
      // Check if there's actually content to parse
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return {}
      }
    } catch (error) {
      console.error("API request failed:", error)
      this.showError("An error occurred while communicating with the server.")
      throw error
    }
  }

  showError(message) {
    this.showNotification(message, 'error')
  }

  showSuccess(message) {
    this.showNotification(message, 'success')
  }
  
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    
    // Add icon based on type
    let icon = 'info-circle'
    if (type === 'success') icon = 'check-circle'
    if (type === 'error') icon = 'exclamation-circle'
    if (type === 'warning') icon = 'exclamation-triangle'
    
    notification.innerHTML = `
      <div class="notification-icon">
        <i class="fas fa-${icon}"></i>
      </div>
      <div class="notification-content">${message}</div>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    `
    
    // Add to the DOM
    const container = document.querySelector('.notifications-container') || this.createNotificationsContainer()
    container.appendChild(notification)
    
    // Add close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.classList.add('notification-hiding')
      setTimeout(() => notification.remove(), 300)
    })
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add('notification-hiding')
        setTimeout(() => notification.remove(), 300)
      }
    }, 5000)
  }
  
  createNotificationsContainer() {
    const container = document.createElement('div')
    container.className = 'notifications-container'
    document.body.appendChild(container)
    return container
  }

  // Student Management
  async loadStudents() {
    try {
      const students = await this.apiRequest("/students/")
      this.renderStudents(students)
      this.populateStudentSelects(students)
    } catch (error) {
      console.error("Failed to load students:", error)
    }
  }

  renderStudents(students) {
    const tbody = document.querySelector("#studentsTable tbody")
    tbody.innerHTML = ""

    students.forEach((student) => {
      const row = document.createElement("tr")
      row.innerHTML = `
              <td>${student.student_id}</td>
              <td>${student.first_name} ${student.last_name}</td>
              <td>${student.email}</td>
              <td>${student.phone || "N/A"}</td>
              <td>
                    <div class="actions">
                        <button class="btn btn-info btn-sm btn-icon" onclick="sms.viewStudentProfile(${student.id})" title="View Profile">
                            <i class="fas fa-user"></i>
                        </button>
                        <button class="btn btn-warning btn-sm btn-icon" onclick="sms.editStudent(${student.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-icon" onclick="sms.deleteStudent(${student.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `
      tbody.appendChild(row)
    })
  }

  populateStudentSelects(students) {
    const selects = ["gradeStudent", "studentFilter"]
    selects.forEach((selectId) => {
      const select = document.getElementById(selectId)
      if (!select) return // Skip if element doesn't exist
      
      const currentValue = select.value
      select.innerHTML =
        selectId === "studentFilter"
          ? '<option value="">All Students</option>'
          : '<option value="">Select Student</option>'

      students.forEach((student) => {
        const option = document.createElement("option")
        option.value = student.id
        option.textContent = `${student.student_id} - ${student.first_name} ${student.last_name}`
        select.appendChild(option)
      })

      if (currentValue) select.value = currentValue
    })
  }

  searchStudents(query) {
    const rows = document.querySelectorAll("#studentsTable tbody tr")
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase()
      row.style.display = text.includes(query.toLowerCase()) ? "" : "none"
    })
  }

  viewStudentProfile(id) {
    this.apiRequest(`/students/${id}/`)
      .then((student) => {
        this.showStudentProfileModal(student)
      })
      .catch((error) => {
        console.error("Failed to load student profile:", error)
      })
  }

  showStudentProfileModal(student) {
    // Create a modal for showing student profile if it doesn't exist
    let modal = document.getElementById("studentProfileModal")
    
    if (!modal) {
      modal = document.createElement("div")
      modal.id = "studentProfileModal"
      modal.className = "modal"
      
      document.body.appendChild(modal)
    }
    
    // Format the enrollment date
    const enrollmentDate = new Date(student.enrollment_date).toLocaleDateString()
    const dob = student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'
    
    // Calculate age if date of birth is available
    let age = 'N/A'
    if (student.date_of_birth) {
      const today = new Date()
      const birthDate = new Date(student.date_of_birth)
      age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
    }
    
    // Build modal content
    modal.innerHTML = `
      <div class="modal-content profile-modal">
        <div class="modal-header">
          <h3>Student Profile</h3>
          <span class="close">&times;</span>
        </div>
        <div class="profile-content">
          <div class="profile-header">
            <div class="profile-avatar">
              <i class="fas fa-user-graduate"></i>
            </div>
            <div class="profile-title">
              <h2>${student.first_name} ${student.last_name}</h2>
              <p>Student ID: ${student.student_id}</p>
            </div>
          </div>
          
          <div class="profile-details">
            <div class="detail-group">
              <h4>Personal Information</h4>
              <div class="detail-row">
                <span class="detail-label">Full Name:</span>
                <span class="detail-value">${student.first_name} ${student.last_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date of Birth:</span>
                <span class="detail-value">${dob}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Age:</span>
                <span class="detail-value">${age}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${student.address || 'N/A'}</span>
              </div>
            </div>
            
            <div class="detail-group">
              <h4>Contact Information</h4>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${student.email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${student.phone || 'N/A'}</span>
              </div>
            </div>
            
            <div class="detail-group">
              <h4>Enrollment Information</h4>
              <div class="detail-row">
                <span class="detail-label">Student ID:</span>
                <span class="detail-value">${student.student_id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Enrollment Date:</span>
                <span class="detail-value">${enrollmentDate}</span>
              </div>
            </div>
          </div>
          
          <div class="profile-actions">
            <button class="btn btn-secondary" onclick="document.getElementById('studentProfileModal').style.display='none'">Close</button>
            <button class="btn btn-primary" onclick="sms.editStudent(${student.id})">Edit Profile</button>
          </div>
        </div>
      </div>
    `
    
    // Show the modal
    modal.style.display = "block"
    
    // Add event listener to close button
    modal.querySelector(".close").addEventListener("click", () => {
      modal.style.display = "none"
    })
    
    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none"
      }
    })
  }

  showStudentModal(student = null) {
    this.currentStudentId = student ? student.id : null
    const modal = document.getElementById("studentModal")
    const title = document.getElementById("studentModalTitle")
    const form = document.getElementById("studentForm")

    title.textContent = student ? "Edit Student" : "Add Student"

    if (student) {
      document.getElementById("studentId").value = student.student_id
      document.getElementById("firstName").value = student.first_name
      document.getElementById("lastName").value = student.last_name
      document.getElementById("email").value = student.email
      document.getElementById("phone").value = student.phone || ""
      document.getElementById("dateOfBirth").value = student.date_of_birth
      document.getElementById("address").value = student.address || ""
    } else {
      form.reset()
    }

    modal.style.display = "block"
  }

  hideStudentModal() {
    document.getElementById("studentModal").style.display = "none"
    this.currentStudentId = null
  }

  async handleStudentSubmit(e) {
    e.preventDefault()

    const formData = {
      student_id: document.getElementById("studentId").value,
      first_name: document.getElementById("firstName").value,
      last_name: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      date_of_birth: document.getElementById("dateOfBirth").value,
      address: document.getElementById("address").value,
    }

    try {
      if (this.currentStudentId) {
        await this.apiRequest(`/students/${this.currentStudentId}/`, {
          method: "PUT",
          body: JSON.stringify(formData),
        })
        this.showSuccess("Student updated successfully!")
      } else {
        await this.apiRequest("/students/", {
          method: "POST",
          body: JSON.stringify(formData),
        })
        this.showSuccess("Student added successfully!")
      }

      this.hideStudentModal()
      this.loadStudents()
    } catch (error) {
      console.error("Failed to save student:", error)
    }
  }

  async editStudent(id) {
    try {
      const student = await this.apiRequest(`/students/${id}/`)
      this.showStudentModal(student)
    } catch (error) {
      console.error("Failed to load student:", error)
    }
  }

  async deleteStudent(id) {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await this.apiRequest(`/students/${id}/`, { method: "DELETE" })
        this.showSuccess("Student deleted successfully!")
        this.loadStudents()
      } catch (error) {
        console.error("Failed to delete student:", error)
      }
    }
  }

  // Subject Management
  async loadSubjects() {
    try {
      const subjects = await this.apiRequest("/subjects/")
      this.renderSubjects(subjects)
      this.populateSubjectSelects(subjects)
    } catch (error) {
      console.error("Failed to load subjects:", error)
    }
  }

  renderSubjects(subjects) {
    const tbody = document.querySelector("#subjectsTable tbody")
    tbody.innerHTML = ""

    subjects.forEach((subject) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${subject.code}</td>
                <td>${subject.name}</td>
                <td><span class="badge badge-primary">${subject.credits}</span></td>
                <td>${subject.description || "N/A"}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-warning btn-sm btn-icon" onclick="sms.editSubject(${subject.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-icon" onclick="sms.deleteSubject(${subject.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `
      tbody.appendChild(row)
    })
  }

  populateSubjectSelects(subjects) {
    const selects = ["gradeSubject", "subjectFilter"]
    selects.forEach((selectId) => {
      const select = document.getElementById(selectId)
      if (!select) return // Skip if element doesn't exist
      
      const currentValue = select.value
      select.innerHTML =
        selectId === "subjectFilter"
          ? '<option value="">All Subjects</option>'
          : '<option value="">Select Subject</option>'

      subjects.forEach((subject) => {
        const option = document.createElement("option")
        option.value = subject.id
        option.textContent = `${subject.code} - ${subject.name}`
        select.appendChild(option)
      })

      if (currentValue) select.value = currentValue
    })
  }
  
  async searchSubjects(query) {
    try {
      const subjects = await this.apiRequest("/subjects/");
      const filteredSubjects = subjects.filter((subject) => {
        return (
          subject.code.toLowerCase().includes(query.toLowerCase()) ||
          subject.name.toLowerCase().includes(query.toLowerCase()) ||
          (subject.description && subject.description.toLowerCase().includes(query.toLowerCase()))
        );
      });
      this.renderSubjects(filteredSubjects);
    } catch (error) {
      console.error("Failed to search subjects:", error);
    }
  }

  showSubjectModal(subject = null) {
    this.currentSubjectId = subject ? subject.id : null
    const modal = document.getElementById("subjectModal")
    const title = document.getElementById("subjectModalTitle")
    const form = document.getElementById("subjectForm")

    title.textContent = subject ? "Edit Subject" : "Add Subject"

    if (subject) {
      document.getElementById("subjectCode").value = subject.code
      document.getElementById("subjectName").value = subject.name
      document.getElementById("credits").value = subject.credits
      document.getElementById("description").value = subject.description || ""
    } else {
      form.reset()
      document.getElementById("credits").value = 3
    }

    modal.style.display = "block"
  }

  hideSubjectModal() {
    document.getElementById("subjectModal").style.display = "none"
    this.currentSubjectId = null
  }

  async handleSubjectSubmit(e) {
    e.preventDefault()

    const formData = {
      code: document.getElementById("subjectCode").value,
      name: document.getElementById("subjectName").value,
      credits: Number.parseInt(document.getElementById("credits").value),
      description: document.getElementById("description").value,
    }

    try {
      if (this.currentSubjectId) {
        await this.apiRequest(`/subjects/${this.currentSubjectId}/`, {
          method: "PUT",
          body: JSON.stringify(formData),
        })
        this.showSuccess("Subject updated successfully!")
      } else {
        await this.apiRequest("/subjects/", {
          method: "POST",
          body: JSON.stringify(formData),
        })
        this.showSuccess("Subject added successfully!")
      }

      this.hideSubjectModal()
      this.loadSubjects()
    } catch (error) {
      console.error("Failed to save subject:", error)
    }
  }

  async editSubject(id) {
    try {
      const subject = await this.apiRequest(`/subjects/${id}/`)
      this.showSubjectModal(subject)
    } catch (error) {
      console.error("Failed to load subject:", error)
    }
  }

  async deleteSubject(id) {
    if (confirm("Are you sure you want to delete this subject?")) {
      try {
        await this.apiRequest(`/subjects/${id}/`, { method: "DELETE" })
        this.showSuccess("Subject deleted successfully!")
        this.loadSubjects()
      } catch (error) {
        console.error("Failed to delete subject:", error)
      }
    }
  }

  // Grade Management
  async loadGrades() {
    try {
      const grades = await this.apiRequest("/grades/")
      this.renderGrades(grades)
    } catch (error) {
      console.error("Failed to load grades:", error)
    }
  }

  async loadEnrollments() {
    return new Promise(async (resolve, reject) => {
      try {
        this.enrollments = await this.apiRequest("/enrollments/")
        resolve(this.enrollments)
      } catch (error) {
        console.error("Failed to load enrollments:", error)
        reject(error)
      }
    })
  }

  renderGrades(grades) {
    const tbody = document.querySelector("#gradesTable tbody")
    tbody.innerHTML = ""

    grades.forEach((grade) => {
      const enrollment = this.enrollments.find((e) => e.id === grade.enrollment)
      if (!enrollment) return

      const row = document.createElement("tr")
      row.innerHTML = `
              <td>${enrollment.student_name} ${enrollment.student_last_name}</td>
              <td>${enrollment.subject_name}</td>
              <td>${grade.grade_type.charAt(0).toUpperCase() + grade.grade_type.slice(1)}</td>
              <td>${grade.title}</td>
              <td>${grade.score}</td>
              <td>${grade.max_score}</td>
              <td>${grade.percentage}%</td>
              <td>${new Date(grade.date_recorded).toLocaleDateString()}</td>
              <td>
                <button class="btn btn-edit" onclick="sms.editGrade(${grade.id})">Edit</button>
                <button class="btn btn-danger" onclick="sms.deleteGrade(${grade.id})">Delete</button>
              </td>
            `
      tbody.appendChild(row)
    })
  }

  async filterGrades() {
    const studentId = document.getElementById("studentFilter").value
    const subjectId = document.getElementById("subjectFilter").value
    const gradeType = document.getElementById("gradeTypeFilter").value

    let url = "/grades/"
    const params = new URLSearchParams()

    if (gradeType) params.append("grade_type", gradeType)

    if (params.toString()) {
      url += "?" + params.toString()
    }

    try {
      let grades = await this.apiRequest(url)

      // Filter by student and subject on frontend since we need enrollment data
      if (studentId || subjectId) {
        grades = grades.filter((grade) => {
          const enrollment = this.enrollments.find((e) => e.id === grade.enrollment)
          if (!enrollment) return false

          if (studentId && enrollment.student !== Number.parseInt(studentId)) return false
          if (subjectId && enrollment.subject !== Number.parseInt(subjectId)) return false

          return true
        })
      }

      this.renderGrades(grades)
    } catch (error) {
      console.error("Failed to filter grades:", error)
    }
  }

  showGradeModal(grade = null) {
    this.currentGradeId = grade ? grade.id : null
    const modal = document.getElementById("gradeModal")
    const title = document.getElementById("gradeModalTitle")
    const form = document.getElementById("gradeForm")

    title.textContent = grade ? "Edit Grade" : "Add Grade"

    if (grade) {
      const enrollment = this.enrollments.find((e) => e.id === grade.enrollment)
      if (enrollment) {
        document.getElementById("gradeStudent").value = enrollment.student
        document.getElementById("gradeSubject").value = enrollment.subject
      }
      document.getElementById("gradeType").value = grade.grade_type
      document.getElementById("gradeTitle").value = grade.title
      document.getElementById("score").value = grade.score
      document.getElementById("maxScore").value = grade.max_score
    } else {
      form.reset()
    }

    modal.style.display = "block"
  }

  hideGradeModal() {
    document.getElementById("gradeModal").style.display = "none"
    this.currentGradeId = null
  }

  async handleGradeSubmit(e) {
    e.preventDefault()

    const studentId = document.getElementById("gradeStudent").value
    const subjectId = document.getElementById("gradeSubject").value

    // Find or create enrollment
    let enrollment = this.enrollments.find((e) => e.student == studentId && e.subject == subjectId)

    if (!enrollment) {
      try {
        enrollment = await this.apiRequest("/enrollments/", {
          method: "POST",
          body: JSON.stringify({
            student: Number.parseInt(studentId),
            subject: Number.parseInt(subjectId),
          }),
        })
        this.enrollments.push(enrollment)
      } catch (error) {
        console.error("Failed to create enrollment:", error)
        return
      }
    }

    const formData = {
      enrollment: enrollment.id,
      grade_type: document.getElementById("gradeType").value,
      title: document.getElementById("gradeTitle").value,
      score: Number.parseFloat(document.getElementById("score").value),
      max_score: Number.parseFloat(document.getElementById("maxScore").value),
    }

    try {
      if (this.currentGradeId) {
        await this.apiRequest(`/grades/${this.currentGradeId}/`, {
          method: "PUT",
          body: JSON.stringify(formData),
        })
        this.showSuccess("Grade updated successfully!")
      } else {
        await this.apiRequest("/grades/", {
          method: "POST",
          body: JSON.stringify(formData),
        })
        this.showSuccess("Grade added successfully!")
      }

      this.hideGradeModal()
      this.loadGrades()
    } catch (error) {
      console.error("Failed to save grade:", error)
    }
  }

  async editGrade(id) {
    try {
      const grade = await this.apiRequest(`/grades/${id}/`)
      this.showGradeModal(grade)
    } catch (error) {
      console.error("Failed to load grade:", error)
    }
  }

  async deleteGrade(id) {
    if (confirm("Are you sure you want to delete this grade?")) {
      try {
        await this.apiRequest(`/grades/${id}/`, { method: "DELETE" })
        this.showSuccess("Grade deleted successfully!")
        this.loadGrades()
      } catch (error) {
        console.error("Failed to delete grade:", error)
      }
    }
  }
}

// Initialize the application
const sms = new StudentManagementSystem()
