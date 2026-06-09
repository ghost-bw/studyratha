import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { 
  HiPlus, 
  HiMagnifyingGlass, 
  HiFunnel, 
  HiEllipsisVertical, 
  HiArrowTopRightOnSquare,
  HiXMark,
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineExclamationCircle,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineArrowPath,
  HiOutlineCamera
} from 'react-icons/hi2';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskLogs, setTaskLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [groupId, setGroupId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Evidence states
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    fetchData();
  }, [filterDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tasksUrl = filterDate ? `/tasks?date=${filterDate}` : '/tasks';
      const [tasksRes, groupsRes] = await Promise.all([
        api.get(tasksUrl),
        api.get('/groups')
      ]);
      setTasks(tasksRes.data);
      setGroups(groupsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuth();

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        deadline,
        priority,
        groupId: groupId || undefined,
        assignedTo: user._id
      };

      if (isEditing && selectedTask) {
        await api.put(`/tasks/${selectedTask._id}`, payload);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created successfully');
      }
      
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} task`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setDeadline(new Date(task.deadline).toISOString().split('T')[0]);
    setPriority(task.priority);
    setGroupId(task.groupId?._id || '');
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleStatusChange = async (task, newStatus) => {
    if (newStatus === 'Pending') {
      try {
        await api.patch(`/tasks/${task._id}/status`, { status: newStatus });
        fetchData();
      } catch (err) {
        console.error(err);
      }
    } else {
      setSelectedTask(task);
      setStatusToUpdate(newStatus);
      setShowEvidenceModal(true);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      toast.error('You can only upload up to 5 images per log.');
      return;
    }
    
    setFiles(prev => [...prev, ...selectedFiles]);
    
    const newUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newUrls]);
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      handleFileChange(e);
    };
    input.click();
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please upload at least one screenshot/picture as evidence.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('taskId', selectedTask._id);
    formData.append('status', statusToUpdate);
    formData.append('notes', notes);
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      await api.post('/tasklogs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowEvidenceModal(false);
      resetEvidenceForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit evidence');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchTaskLogs = async (taskId) => {
    setSelectedTask(tasks.find(t => t._id === taskId));
    setShowLogsModal(true);
    setLogsLoading(true);
    try {
      const { data } = await api.get(`/tasklogs/task/${taskId}`);
      setTaskLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setPriority('Medium');
    setGroupId('');
  };

  const resetEvidenceForm = () => {
    setStatusToUpdate('');
    setNotes('');
    setFiles([]);
    setPreviewUrls([]);
    setSelectedTask(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <HiOutlineCheckCircle size={28} className="text-green-500" />;
      case 'In Progress': return <HiOutlineClock size={28} className="text-amber-500" />;
      default: return <HiOutlineExclamationCircle size={28} className="text-slate-300" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800';
      case 'Medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800';
      default: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800';
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your study schedule and track progress.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsEditing(false); setShowCreateModal(true); }}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-95"
        >
          <HiPlus size={20} />
          <span>Add Task</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-96">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
          />
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center space-x-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
            <HiOutlineCalendar size={18} className="text-slate-400" />
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent outline-none text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate('')}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Clear Filter"
              >
                <HiXMark size={16} />
              </button>
            )}
          </div>
          <button 
            disabled
            className="hidden md:flex items-center justify-center space-x-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all opacity-50 cursor-not-allowed"
          >
            <HiFunnel size={18} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <Loader2 className="animate-spin text-primary-600" size={48} />
          <p className="text-slate-500 font-medium animate-pulse">Loading your tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-4 border-dashed border-slate-100 dark:border-slate-800">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineCalendar size={40} className="text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No tasks yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Start by creating your first study task.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTasks.map((task) => (
            <div key={task._id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center gap-6 group">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                {getStatusIcon(task.status)}
              </div>
              <div className="flex-grow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xl group-hover:text-primary-600 transition-colors">{task.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{task.description}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-100 dark:border-slate-800">
                    <HiOutlineCalendar size={14} className="text-primary-500" />
                    <span>{new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-100 dark:border-slate-800">
                    <img src={task.assignedTo?.avatar || `https://ui-avatars.com/api/?name=${task.assignedTo?.name}`} alt="" className="w-4 h-4 rounded-full" />
                    <span>{task.assignedTo?._id === user?._id ? 'You' : task.assignedTo?.name}</span>
                  </div>
                  {task.groupId && (
                    <div className="flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full text-xs font-bold text-primary-600 border border-primary-100 dark:border-primary-900/30">
                      <HiOutlineUsers size={14} />
                      <span>{task.groupId.name}</span>
                    </div>
                  )}
                  {task.status !== 'Pending' && (
                    <button 
                      onClick={() => fetchTaskLogs(task._id)}
                      className="flex items-center space-x-2 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full border border-primary-100 dark:border-primary-900/30"
                    >
                      <HiArrowTopRightOnSquare size={14} />
                      <span>View Evidence</span>
                    </button>
                  )}
                  {task.status === 'In Progress' && task.assignedTo?._id === user?._id && (
                    <button 
                      onClick={() => { setSelectedTask(task); setStatusToUpdate('In Progress'); setShowEvidenceModal(true); }}
                      className="flex items-center space-x-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/30"
                    >
                      <HiOutlineArrowPath size={14} />
                      <span>Log Progress</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50 dark:border-slate-800">
                {task.assignedTo?._id === user?._id ? (
                  <select 
                    value={task.status}
                    disabled={task.status === 'Completed'}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    className={`rounded-xl px-4 py-2 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-primary-500 transition-all cursor-pointer ${
                      task.status === 'Completed' ? 'bg-green-100 text-green-700 opacity-75 cursor-not-allowed' :
                      task.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                ) : (
                  <div className={`rounded-xl px-4 py-2 text-sm font-bold ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {task.status}
                  </div>
                )}
                {task.createdBy?._id === user?._id && (
                  <button 
                    onClick={() => handleEditTask(task)}
                    disabled={Date.now() - new Date(task.createdAt).getTime() > 5 * 60 * 1000}
                    className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={Date.now() - new Date(task.createdAt).getTime() > 5 * 60 * 1000 ? "Editing expired (5 mins passed)" : "Edit Task"}
                  >
                    <HiOutlineArrowPath size={20} className="rotate-180" />
                  </button>
                )}
                <button className="p-3 text-slate-300 hover:text-slate-600 dark:hover:text-slate-100 transition-colors">
                  <HiEllipsisVertical size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
                <input 
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none focus:border-primary-500 dark:text-white transition-all"
                  placeholder="What needs to be done?"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none focus:border-primary-500 dark:text-white transition-all"
                  placeholder="Add some details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Deadline</label>
                  <input 
                    type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-5 py-3 border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none focus:border-primary-500 dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Priority</label>
                  <select 
                    value={priority} onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-5 py-3 border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none focus:border-primary-500 dark:text-white transition-all cursor-pointer font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Assign to Group (Optional)</label>
                <select 
                  value={groupId} onChange={(e) => setGroupId(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none focus:border-primary-500 dark:text-white transition-all cursor-pointer font-bold"
                >
                  <option value="">Personal Task (No Group)</option>
                  {groups.map(g => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-3 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 flex items-center justify-center transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Submit Evidence</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Please provide a screenshot to mark this task as <span className="text-primary-600 font-bold">{statusToUpdate}</span>.</p>
            
            <form onSubmit={handleSubmitEvidence} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-950 hover:border-primary-500 transition-colors relative group">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                      <HiPlus className="text-primary-600" size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Upload Files</p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleCameraCapture}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-950 hover:border-primary-500 transition-colors group"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                      <HiOutlineCamera className="text-primary-600" size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Take Photo</p>
                  </div>
                </button>
              </div>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative group overflow-hidden rounded-xl border-2 border-white dark:border-slate-800 shadow-sm">
                      <img src={url} alt="Preview" className="w-full h-24 object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <HiXMark size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Notes (Optional)</label>
                <textarea 
                  rows="2" value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none focus:border-primary-500 dark:text-white transition-all"
                  placeholder="Anything you'd like to add?"
                />
              </div>

              <div className="flex space-x-4 pt-2">
                <button type="button" onClick={() => { setShowEvidenceModal(false); resetEvidenceForm(); }} className="flex-1 px-6 py-3 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting || files.length === 0} className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <HiOutlineClock className="animate-spin" size={20} /> : "Submit Progress"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs/Evidence Viewer Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Task Progress Evidence</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Logs for: <span className="text-primary-600">{selectedTask?.title}</span></p>
                </div>
                <button onClick={() => setShowLogsModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <HiXMark size={24} className="text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 space-y-8">
              {logsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <HiOutlineClock className="animate-spin text-primary-600" size={40} />
                  <p className="text-slate-500 font-medium animate-pulse">Fetching logs...</p>
                </div>
              ) : taskLogs.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-500">No logs found for this task.</p>
                </div>
              ) : (
                taskLogs.map((log) => (
                  <div key={log._id} className="space-y-4 pb-8 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={log.userId?.avatar || `https://ui-avatars.com/api/?name=${log.userId?.name}`} alt="" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{log.userId?.name}</p>
                          <p className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    {log.notes && (
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-sm text-slate-600 dark:text-slate-300">
                        "{log.notes}"
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {log.imageUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-2xl">
                          <img src={url} alt="Evidence" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <HiArrowTopRightOnSquare className="text-white" size={24} />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
