"use client"

import { useState, useRef, useEffect } from "react"
import {
  Mail,
  Upload,
  Users,
  Send,
  Plus,
  Trash2,
  FileText,
  ImageIcon,
  Video,
  Paperclip,
  Download,
  Edit,
  Power,
  X,
} from "lucide-react"
import Select from "react-select"
import "./App.css"
import NewCustomAlert from "./NewCustomAlert"

// Custom styles for react-select
const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "42px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#cbd5e1",
    },
    backgroundColor: "white",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#f1f5f9",
    borderRadius: "6px",
    padding: "2px 4px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#334155",
    fontSize: "13px",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#94a3b8",
    "&:hover": {
      backgroundColor: "#e2e8f0",
      color: "#334155",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  }),
}

// ConfirmModal Component
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-150 text-sm font-medium"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-150 text-sm font-medium"
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  )
}

// GroupEmailsModal Component
const GroupEmailsModal = ({ isOpen, group, onClose }) => {
  if (!isOpen || !group) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">{`إيميلات المجموعة: ${group.name}`}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors duration-150">
            <X className="w-6 h-6" />
          </button>
        </div>
        <ul className="space-y-2">
          {group.emails.map((email, index) => (
            <li key={index} className="text-slate-700">
              {email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function App() {
  // Core states
  const [emails, setEmails] = useState([])
  const [groups, setGroups] = useState([])
  const [activeTab, setActiveTab] = useState("emails")

  // Email management states
  const [currentEmail, setCurrentEmail] = useState("")

  // Group management states
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedEmailsForGroup, setSelectedEmailsForGroup] = useState([])
  const [editingGroup, setEditingGroup] = useState(null)

  // Send email states
  const [emailSubject, setEmailSubject] = useState("")
  const [emailContent, setEmailContent] = useState("")
  const [selectedEmailsForSend, setSelectedEmailsForSend] = useState([])
  const [selectedGroupsForSend, setSelectedGroupsForSend] = useState([])
  const [attachments, setAttachments] = useState([])

  // UI states
  const [isLoading, setIsLoading] = useState(false)
  const [openAlert, setOpenAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState("success")
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showGroupDeleteModal, setShowGroupDeleteModal] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState(null)
  const [showGroupEmailsModal, setShowGroupEmailsModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)

  // Refs
  const excelInputRef = useRef(null)
  const attachmentInputRef = useRef(null)
  const groupExcelInputRef = useRef(null)
  const sendExcelInputRef = useRef(null)
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"

  useEffect(() => {
    loadDataFromServer()
  }, [])

  const loadDataFromServer = async () => {
    try {
      const response = await fetch(`${baseURL}/api/get-data`)
      const result = await response.json()
      if (result.success) {
        setEmails(result.emails || [])
        setGroups(result.groups || [])
      } else {
        showCustomAlert("خطأ في تحميل البيانات: " + result.error, "error")
      }
    } catch (error) {
      console.error("Error loading data:", error)
      showCustomAlert("خطأ في تحميل البيانات", "error")
    }
  }

  // Save data to server
  const saveDataToServer = async (newEmails, newGroups) => {
    try {
      const response = await fetch(`${baseURL}/api/save-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: newEmails || emails,
          groups: newGroups || groups,
        }),
      })
      const result = await response.json()
      if (!result.success) {
        console.error("Error saving data:", result.error)
        showCustomAlert("خطأ في حفظ البيانات", "error")
      }
    } catch (error) {
      console.error("Error saving data:", error)
      showCustomAlert("خطأ في حفظ البيانات", "error")
    }
  }

  // Clear all data
  const clearAllData = async () => {
    setShowConfirmModal(false)
    try {
      await fetch(`${baseURL}/api/clear-data`, {
        method: "POST",
      })
      setEmails([])
      setGroups([])
      setCurrentEmail("")
      setNewGroupName("")
      setSelectedEmailsForGroup([])
      setEditingGroup(null)
      setEmailSubject("")
      setEmailContent("")
      setAttachments([])
      setSelectedEmailsForSend([])
      setSelectedGroupsForSend([])
      showCustomAlert("تم مسح جميع البيانات", "success")
    } catch (error) {
      showCustomAlert("خطأ في مسح البيانات", "error")
    }
  }

  // Custom Alert function
  const showCustomAlert = (msg, type = "success") => {
    setAlertMessage(msg)
    setAlertType(type)
    setOpenAlert(true)
  }

  // Add single email
  const addEmail = async () => {
    if (currentEmail && !emails.includes(currentEmail)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(currentEmail)) {
        const newEmails = [...emails, currentEmail]
        setEmails(newEmails)
        await saveDataToServer(newEmails)
        setCurrentEmail("")
      } else {
        showCustomAlert("يرجى إدخال إيميل صالح", "error")
      }
    } else {
      showCustomAlert("الإيميل موجود بالفعل أو فارغ", "error")
    }
  }

  // Remove email
  const removeEmail = async (emailToRemove) => {
    const newEmails = emails.filter((email) => email !== emailToRemove)
    setEmails(newEmails)
    await saveDataToServer(newEmails)
    showCustomAlert("تم حذف الإيميل", "success")
  }

  // Handle file upload
  const handleFileUpload = async (event, setSelectedCallback) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      setIsLoading(true)
      const response = await fetch(`${baseURL}/api/upload-file`, {
        method: "POST",
        body: formData,
      })
      const result = await response.json()
      if (result.success) {
        const updatedMainEmails = [...new Set([...emails, ...result.emails])]
        setEmails(updatedMainEmails)
        await saveDataToServer(updatedMainEmails)

        if (setSelectedCallback) {
          setSelectedCallback([
            ...new Set([
              ...(setSelectedCallback === setSelectedEmailsForGroup ? selectedEmailsForGroup : selectedEmailsForSend),
              ...result.emails,
            ]),
          ])
        }

        showCustomAlert(`تم استيراد ${result.emails.length} إيميل`, "success")
      } else {
        showCustomAlert("خطأ في استيراد الملف: " + result.error, "error")
      }
    } catch (error) {
      showCustomAlert("خطأ في رفع الملف", "error")
    } finally {
      setIsLoading(false)
      if (event.target) event.target.value = ""
    }
  }

  // Create new group
  const createGroup = async () => {
    if (newGroupName && selectedEmailsForGroup.length > 0) {
      const newGroup = {
        id: Date.now().toString(),
        name: newGroupName,
        emails: [...selectedEmailsForGroup],
      }
      const newGroups = [...groups, newGroup]
      setGroups(newGroups)
      await saveDataToServer(emails, newGroups)
      setNewGroupName("")
      setSelectedEmailsForGroup([])
      setShowGroupModal(false)
      showCustomAlert("تم إنشاء المجموعة بنجاح", "success")
    } else {
      showCustomAlert("يرجى إدخال اسم المجموعة واختيار إيميلات", "error")
    }
  }

  // Edit group
  const startEditGroup = (group) => {
    setEditingGroup(group)
    setNewGroupName(group.name)
    setSelectedEmailsForGroup(group.emails)
    setShowGroupModal(true)
  }

  // Save edited group
  const saveEditedGroup = async () => {
    if (editingGroup && newGroupName) {
      const newGroups = groups.map((g) =>
        g.id === editingGroup.id ? { ...g, name: newGroupName, emails: selectedEmailsForGroup } : g,
      )
      setGroups(newGroups)
      await saveDataToServer(emails, newGroups)
      setEditingGroup(null)
      setNewGroupName("")
      setSelectedEmailsForGroup([])
      setShowGroupModal(false)
      showCustomAlert("تم تحديث المجموعة بنجاح", "success")
    }
  }

  // Delete group
  const deleteGroup = async () => {
    if (groupToDelete) {
      const newGroups = groups.filter((g) => g.id !== groupToDelete)
      setGroups(newGroups)
      await saveDataToServer(emails, newGroups)
      setShowGroupDeleteModal(false)
      setGroupToDelete(null)
      showCustomAlert("تم حذف المجموعة", "success")
    }
  }

  // Show group delete confirmation
  const confirmDeleteGroup = (groupId) => {
    setGroupToDelete(groupId)
    setShowGroupDeleteModal(true)
  }

  // Show group emails
  const showGroupEmails = (group) => {
    setSelectedGroup(group)
    setShowGroupEmailsModal(true)
  }

  // Export group to CSV
  const exportGroupToCSV = (group) => {
    const csvContent = "data:text/csv;charset=utf-8,Emails\n" + group.emails.join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${group.name}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showCustomAlert("تم تصدير المجموعة بنجاح", "success")
  }

  // Handle file upload for groups
  const handleGroupFileUpload = async (event) => {
    await handleFileUpload(event, setSelectedEmailsForGroup)
  }

  // Handle file upload for sending
  const handleSendFileUpload = async (event) => {
    await handleFileUpload(event, setSelectedEmailsForSend)
  }

  // Handle attachments
  const handleAttachments = (event) => {
    const files = Array.from(event.target.files || [])
    setAttachments([...attachments, ...files])
  }

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  // Get all selected emails for sending
  const getAllSelectedEmails = () => {
    const allEmails = new Set()

    selectedEmailsForSend.forEach((email) => allEmails.add(email))

    selectedGroupsForSend.forEach((groupId) => {
      const group = groups.find((g) => g.id === groupId)
      if (group) {
        group.emails.forEach((email) => allEmails.add(email))
      }
    })

    return Array.from(allEmails)
  }

  // Send emails
  const sendEmails = async () => {
    const recipientEmails = getAllSelectedEmails()

    console.log("[v0] Starting sendEmails function")
    console.log("[v0] Recipient emails:", recipientEmails.length)

    if (recipientEmails.length === 0) {
      showCustomAlert("يرجى اختيار مستلمين للرسالة", "error")
      return
    }

    const formData = new FormData()
    formData.append("subject", emailSubject || "رسالة بدون عنوان")
    formData.append("content", emailContent || "رسالة بدون محتوى")
    formData.append("emails", JSON.stringify(recipientEmails))

    attachments.forEach((file, index) => {
      formData.append(`attachment${index}`, file)
    })

    console.log("[v0] FormData prepared, making request to:", `${baseURL}/api/send-emails`)

    try {
      setIsLoading(true)
      const response = await fetch(`${baseURL}/api/send-emails`, {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Response status:", response.status)

      let result
      try {
        result = await response.json()
        console.log("[v0] Response data:", result)
      } catch (jsonError) {
        console.error("[v0] Failed to parse JSON response:", jsonError)
        showCustomAlert("خطأ في الاتصال بالخادم. تأكد من أن الخادم يعمل على: " + baseURL, "error")
        return
      }

      if (result.success) {
        showCustomAlert(`تم إرسال ${result.sent || recipientEmails.length} رسالة بنجاح`, "success")
        setEmailSubject("")
        setEmailContent("")
        setAttachments([])
        setSelectedEmailsForSend([])
        setSelectedGroupsForSend([])
      } else {
        console.error("[v0] Send failed:", result.error)
        showCustomAlert("خطأ في الإرسال: " + result.error, "error")
      }
    } catch (error) {
      console.error("[v0] Network error:", error)
      showCustomAlert("خطأ في الاتصال بالخادم. تأكد من أن الخادم يعمل على: " + baseURL, "error")
    } finally {
      setIsLoading(false)
      console.log("[v0] sendEmails function completed")
    }
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) return <ImageIcon className="w-4 h-4 text-slate-500" />
    if (["mp4", "avi", "mov"].includes(extension || "")) return <Video className="w-4 h-4 text-slate-500" />
    if (["pdf", "doc", "docx", "txt"].includes(extension || "")) return <FileText className="w-4 h-4 text-slate-500" />
    return <Paperclip className="w-4 h-4 text-slate-500" />
  }

  // Convert emails to react-select options
  const emailOptions = emails.map((email) => ({ value: email, label: email }))
  const groupOptions = groups.map((group) => ({
    value: group.id,
    label: `${group.name} (${group.emails.length} إيميل)`,
  }))

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Alert Component */}
      <NewCustomAlert
        openAlert={openAlert}
        message={alertMessage}
        type={alertType}
        onClose={() => setOpenAlert(false)}
        language="AR"
        autoClose={true}
        duration={3000}
      />

      {/* Confirm Modal for Ending Session */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="تأكيد مسح البيانات"
        message="هل أنت متأكد من مسح جميع البيانات؟"
        onConfirm={clearAllData}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Confirm Modal for Group Deletion */}
      <ConfirmModal
        isOpen={showGroupDeleteModal}
        title="تأكيد حذف المجموعة"
        message="هل أنت متأكد من حذف هذه المجموعة؟"
        onConfirm={deleteGroup}
        onCancel={() => {
          setShowGroupDeleteModal(false)
          setGroupToDelete(null)
        }}
      />

      {/* Group Emails Modal */}
      <GroupEmailsModal
        isOpen={showGroupEmailsModal}
        group={selectedGroup}
        onClose={() => setShowGroupEmailsModal(false)}
      />

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  {editingGroup ? `تعديل مجموعة: ${editingGroup.name}` : "إنشاء مجموعة جديدة"}
                </h2>
                <button
                  onClick={() => {
                    setShowGroupModal(false)
                    setEditingGroup(null)
                    setNewGroupName("")
                    setSelectedEmailsForGroup([])
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-150"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  editingGroup ? saveEditedGroup() : createGroup()
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <FileText className="w-4 h-4 inline" />
                      <span>اسم المجموعة</span>
                    </label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      placeholder="اسم المجموعة"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Users className="w-4 h-4 inline" />
                      <span>اختر الإيميلات</span>
                    </label>
                    <Select
                      isMulti
                      options={emailOptions}
                      value={emailOptions.filter((option) => selectedEmailsForGroup.includes(option.value))}
                      onChange={(selected) => setSelectedEmailsForGroup(selected ? selected.map((s) => s.value) : [])}
                      styles={selectStyles}
                      placeholder="ابحث واختر الإيميلات..."
                      noOptionsMessage={() => "لا توجد إيميلات"}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Upload className="w-4 h-4 inline" />
                      <span>أو استيراد من Excel أو CSV</span>
                    </label>
                    <input
                      type="file"
                      ref={groupExcelInputRef}
                      onChange={handleGroupFileUpload}
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => groupExcelInputRef.current?.click()}
                      disabled={isLoading}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 transition-colors duration-150"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-b-transparent"></div>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          رفع Excel أو CSV
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGroupModal(false)
                      setEditingGroup(null)
                      setNewGroupName("")
                      setSelectedEmailsForGroup([])
                    }}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-150 text-sm font-medium"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-150 flex items-center gap-2 text-sm font-medium"
                  >
                    {editingGroup ? "حفظ" : "إنشاء"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-1">نظام إرسال الإيميلات</h1>
              <p className="text-slate-600 text-sm">إدارة وإرسال الإيميلات بكفاءة</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors duration-150"
              >
                <Power className="w-4 h-4" />
                مسح البيانات
              </button>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-semibold text-slate-800">{emails.length}</div>
              <div className="text-slate-600">إيميل</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-slate-800">{groups.length}</div>
              <div className="text-slate-600">مجموعة</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <div className="flex border-b border-slate-200">
            {[
              { id: "emails", label: "الإيميلات", icon: Mail },
              { id: "groups", label: "المجموعات", icon: Users },
              { id: "send", label: "الإرسال", icon: Send },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-150 ${
                  activeTab === tab.id ? "bg-blue-500 text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Emails Tab */}
            {activeTab === "emails" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-slate-900">إدارة الإيميلات</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={addEmail}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 text-sm font-medium transition-colors duration-150"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة إيميل
                    </button>
                    <button
                      onClick={() => excelInputRef.current?.click()}
                      disabled={isLoading}
                      className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors duration-150"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-b-transparent"></div>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          استيراد من Excel أو CSV
                        </>
                      )}
                    </button>
                    <input
                      type="file"
                      ref={excelInputRef}
                      onChange={(e) => handleFileUpload(e)}
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <input
                    type="email"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addEmail()}
                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                    placeholder="example@email.com"
                  />
                </div>

                {/* Email Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          الإيميل
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          إجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {emails.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-6 py-4 text-center text-slate-500">
                            لا توجد إيميلات
                          </td>
                        </tr>
                      ) : (
                        emails.map((email, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => removeEmail(email)}
                                className="text-red-500 hover:text-red-700 transition-colors duration-150"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Groups Tab */}
            {activeTab === "groups" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-slate-900">إدارة المجموعات</h2>
                  <button
                    onClick={() => setShowGroupModal(true)}
                    disabled={emails.length === 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-colors duration-150"
                  >
                    <Plus className="w-4 h-4" />
                    مجموعة جديدة
                  </button>
                </div>

                {emails.length === 0 && (
                  <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 text-sm text-yellow-800">
                    يجب إضافة إيميلات أولاً قبل إنشاء المجموعات
                  </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      لا توجد مجموعات
                    </div>
                  ) : (
                    groups.map((group) => (
                      <div
                        key={group.id}
                        onClick={() => showGroupEmails(group)}
                        className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-150 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-slate-900">{group.name}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditGroup(group)
                              }}
                              className="text-slate-600 hover:text-slate-800 p-1 transition-colors duration-150"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                exportGroupToCSV(group)
                              }}
                              className="text-slate-600 hover:text-slate-800 p-1 transition-colors duration-150"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                confirmDeleteGroup(group.id)
                              }}
                              className="text-slate-600 hover:text-red-600 p-1 transition-colors duration-150"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{group.emails.length} إيميل</p>
                        <div className="max-h-24 overflow-y-auto text-xs text-slate-600 space-y-1">
                          {group.emails.slice(0, 3).map((email, i) => (
                            <div key={i} className="truncate">
                              {email}
                            </div>
                          ))}
                          {group.emails.length > 3 && (
                            <div className="text-slate-500">... و {group.emails.length - 3} آخرين</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Send Tab */}
            {activeTab === "send" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900">إرسال الرسائل</h2>

                {/* Recipients Selection */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">اختيار المستلمين</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        اختيار إيميلات ({selectedEmailsForSend.length})
                      </label>
                      <Select
                        isMulti
                        options={emailOptions}
                        value={emailOptions.filter((option) => selectedEmailsForSend.includes(option.value))}
                        onChange={(selected) => setSelectedEmailsForSend(selected ? selected.map((s) => s.value) : [])}
                        styles={selectStyles}
                        placeholder="ابحث واختر..."
                        noOptionsMessage={() => "لا توجد إيميلات"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        اختيار مجموعات ({selectedGroupsForSend.length})
                      </label>
                      <Select
                        isMulti
                        options={groupOptions}
                        value={groupOptions.filter((option) => selectedGroupsForSend.includes(option.value))}
                        onChange={(selected) => setSelectedGroupsForSend(selected ? selected.map((s) => s.value) : [])}
                        styles={selectStyles}
                        placeholder="ابحث واختر..."
                        noOptionsMessage={() => "لا توجد مجموعات"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">استيراد من Excel أو CSV</label>
                      <input
                        type="file"
                        ref={sendExcelInputRef}
                        onChange={handleSendFileUpload}
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                        className="hidden"
                      />
                      <button
                        onClick={() => sendExcelInputRef.current?.click()}
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 transition-colors duration-150"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-b-transparent"></div>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            رفع Excel أو CSV
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                    <span className="font-medium">إجمالي المستلمين: {getAllSelectedEmails().length} إيميل</span>
                  </div>
                </div>

                {/* Email Content */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">عنوان الرسالة (اختياري)</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      placeholder="عنوان الرسالة..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">محتوى الرسالة (اختياري)</label>
                    <textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      placeholder="محتوى الرسالة..."
                    />
                  </div>
                </div>

                {/* Attachments */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                  <label className="block text-sm font-medium text-slate-700 mb-2">المرفقات</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      ref={attachmentInputRef}
                      onChange={handleAttachments}
                      accept="*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => attachmentInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 mx-auto text-slate-600 hover:text-slate-800 transition-colors duration-150"
                    >
                      <Upload className="w-5 h-5" />
                      اختر ملفات متعددة
                    </button>
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-50 p-3 rounded-lg text-sm border border-slate-200"
                        >
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.name)}
                            <span className="text-slate-900">{file.name}</span>
                            <span className="text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="text-slate-600 hover:text-red-600 transition-colors duration-150"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <button
                  onClick={sendEmails}
                  disabled={isLoading || getAllSelectedEmails().length === 0}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-150"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-b-transparent"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      إرسال الرسائل ({getAllSelectedEmails().length})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
