import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlinePlus, 
  HiOutlineUsers, 
  HiOutlineClipboardDocument, 
  HiOutlineCheck, 
  HiOutlineArrowTopRightOnSquare, 
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineCheckBadge,
  HiXMark,
  HiOutlineTrash,
  HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupTasks, setGroupTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [memberFilter, setMemberFilter] = useState(null);

  // Evidence Viewer states
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskLogs, setTaskLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Form states
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (group) => {
    setSelectedGroup(group);
    setTasksLoading(true);
    setMemberFilter(null);
    try {
      const { data } = await api.get(`/tasks/group/${group._id}`);
      setGroupTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchTaskLogs = async (taskId) => {
    setSelectedTask(groupTasks.find(t => t._id === taskId));
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

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/groups', { name: groupName, description: groupDesc });
      setShowCreateModal(false);
      setGroupName('');
      setGroupDesc('');
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/groups/join', { inviteCode });
      setShowJoinModal(false);
      setInviteCode('');
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await api.post(`/groups/${groupId}/leave`);
        setSelectedGroup(null);
        fetchGroups();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to leave group');
      }
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This action is permanent and will delete all group tasks.')) {
      try {
        await api.delete(`/groups/${groupId}`);
        setSelectedGroup(null);
        fetchGroups();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete group');
      }
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTasks = memberFilter 
    ? groupTasks.filter(t => t.assignedTo?._id === memberFilter)
    : groupTasks;

  if (selectedGroup) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={() => setSelectedGroup(null)}
          className="flex items-center space-x-2 text-slate-500 hover:text-primary-600 transition-colors mb-4"
        >
          <HiOutlineArrowLeft size={20} />
          <span className="font-medium">Back to Groups</span>
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-primary-200/50">
                <HiOutlineUsers size={32} className="text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedGroup.name}</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{selectedGroup.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Invite Code</span>
                <button 
                  onClick={() => copyToClipboard(selectedGroup.inviteCode, selectedGroup._id)}
                  className="flex items-center space-x-2 text-lg font-mono font-bold text-primary-600"
                >
                  <span>{selectedGroup.inviteCode}</span>
                  {copiedId === selectedGroup._id ? <HiOutlineCheck size={18} className="text-green-500" /> : <HiOutlineClipboardDocument size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selectedGroup.admin?._id === user?._id ? (
                <button 
                  onClick={() => handleDeleteGroup(selectedGroup._id)}
                  className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-600 px-4 py-2.5 rounded-xl font-bold border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-all active:scale-95"
                >
                  <HiOutlineTrash size={20} />
                  <span>Delete</span>
                </button>
              ) : (
                <button 
                  onClick={() => handleLeaveGroup(selectedGroup._id)}
                  className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all active:scale-95"
                >
                  <HiOutlineArrowRightOnRectangle size={20} />
                  <span>Leave</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
                  <HiOutlineUsers size={16} />
                  <span>Members ({selectedGroup.members.length})</span>
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setMemberFilter(null)}
                    className={`w-full flex items-center space-x-3 p-2 rounded-xl transition-all ${!memberFilter ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 ring-1 ring-primary-100 dark:ring-primary-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                      <HiOutlineUsers size={18} />
                    </div>
                    <span className="font-bold">All Members</span>
                  </button>
                  {selectedGroup.members.map((member) => (
                    <button 
                      key={member._id} 
                      onClick={() => setMemberFilter(member._id)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-xl transition-all ${memberFilter === member._id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 ring-1 ring-primary-100 dark:ring-primary-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <img 
                        src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}`} 
                        alt={member.name} 
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"
                      />
                      <div className="text-left">
                        <p className="text-sm font-bold truncate max-w-[120px]">{member.name}</p>
                        {selectedGroup.admin?._id === member._id && (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-1.5 py-0.5 rounded-md font-bold">Admin</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <HiOutlineCheckBadge size={16} />
                  <span>{memberFilter ? "Member Tasks" : "Group Tasks"}</span>
                </h3>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-3 py-1 rounded-full">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              {tasksLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <HiOutlineArrowPath className="animate-spin text-primary-600" size={40} />
                  <p className="text-slate-500 animate-pulse font-medium">Loading group tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <HiOutlineCalendar size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">No tasks found</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    {memberFilter ? "This member doesn't have any tasks in this group." : "Start by adding a task to this group."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredTasks.map((task) => (
                    <div key={task._id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-grow">
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">{task.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                            task.priority === 'High' ? 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-100' :
                            task.priority === 'Medium' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100' :
                            'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">{task.description}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-4">
                          <div className="flex items-center space-x-2">
                            <img src={task.assignedTo?.avatar || `https://ui-avatars.com/api/?name=${task.assignedTo?.name}`} alt="" className="w-5 h-5 rounded-full" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{task.assignedTo?.name}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-slate-400">
                            <HiOutlineClock size={14} />
                            <span>{new Date(task.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                            task.status === 'Completed' ? 'bg-green-100 text-green-600' :
                            task.status === 'In Progress' ? 'bg-amber-100 text-amber-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {task.status}
                          </div>
                          {task.status !== 'Pending' && (
                            <button 
                              onClick={() => fetchTaskLogs(task._id)}
                              className="flex items-center space-x-1 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              <HiOutlineArrowTopRightOnSquare size={14} />
                              <span>View Evidence</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evidence Viewer Modal */}
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
                              <HiOutlineArrowTopRightOnSquare className="text-white" size={24} />
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
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Study Groups</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Collaborate and track progress with your peers.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="flex items-center space-x-2 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            <HiOutlineArrowTopRightOnSquare size={20} />
            <span>Join Group</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-95"
          >
            <HiOutlinePlus size={20} />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <HiOutlineArrowPath className="animate-spin text-primary-600" size={48} />
          <p className="text-slate-500 font-bold animate-pulse">Fetching your groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-dashed border-slate-100 dark:border-slate-800 p-20 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <HiOutlineUsers size={40} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No groups found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto font-medium">
            You are not part of any study groups yet. Create one or join using an invite code.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {groups.map((group) => (
            <div 
              key={group._id} 
              onClick={() => fetchGroupDetails(group)}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-primary-200/50">
                  <HiOutlineUsers size={28} className="text-primary-600" />
                </div>
                <div className="flex -space-x-3">
                  {group.members.slice(0, 4).map((member, i) => (
                    <img key={i} src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}`} alt={member.name} className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800" />
                  ))}
                  {group.members.length > 4 && (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 flex items-center justify-center text-xs font-black text-slate-500 ring-1 ring-slate-100 dark:ring-slate-800">
                      +{group.members.length - 4}
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">{group.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 h-10 leading-relaxed font-medium">{group.description}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800 relative z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Invite Code</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-primary-600 tracking-wider">{group.inviteCode}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(group.inviteCode, group._id);
                      }}
                      className="text-slate-300 hover:text-primary-600 transition-colors p-1 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                      {copiedId === group._id ? <HiOutlineCheck size={18} className="text-green-500" /> : <HiOutlineClipboardDocument size={18} />}
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                  <HiOutlineArrowTopRightOnSquare size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Create Study Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Group Name</label>
                <input 
                  type="text" required value={groupName} onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl outline-none focus:border-primary-500 dark:text-white transition-all"
                  placeholder="e.g. Finals Prep 2026"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  rows="3" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl outline-none focus:border-primary-500 dark:text-white transition-all"
                  placeholder="What is this group about?"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 transition-all">
                  {isSubmitting ? <HiOutlineArrowPath className="animate-spin" size={20} /> : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Join Group</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium">Enter the 8-character code shared by the admin.</p>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Invite Code</label>
                <input 
                  type="text" required value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl outline-none focus:border-primary-500 dark:text-white font-mono text-center text-xl tracking-widest uppercase"
                  placeholder="XXXX-XXXX"
                  maxLength="8"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 px-4 py-3 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 transition-all">
                  {isSubmitting ? <HiOutlineArrowPath className="animate-spin" size={20} /> : "Join"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
