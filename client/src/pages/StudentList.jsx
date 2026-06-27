import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, updateStudentProfile, deleteStudentProfile } from '../store/slices/studentSlice.js';
import { Search, Edit2, Trash2, X, Check, Eye } from 'lucide-react';
import StudentAvatar from '../components/StudentAvatar.jsx';

export const StudentList = () => {
  const dispatch = useDispatch();
  const { list: students, loading } = useSelector((state) => state.students);

  const [searchQuery, setSearchQuery] = useState('');
  
  // Inline edit state
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    studentId: '',
    name: '',
    email: '',
  });

  // Selected student for pictures preview modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  const handleStartEdit = (student) => {
    setEditingStudentId(student._id);
    setEditFormData({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
    });
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
  };

  const handleSaveEdit = (id) => {
    dispatch(updateStudentProfile({ id, data: editFormData }));
    setEditingStudentId(null);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete student profile for ${name}?`)) {
      dispatch(deleteStudentProfile(id));
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white m-0">Student Directory</h2>
          <p className="text-gray-400 text-xs mt-1 font-medium">
            Manage student registrations and verify descriptors templates
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search directory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {filteredStudents.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-sm font-semibold">No Registered Students Found</p>
              <p className="text-xs text-gray-600 mt-1">
                {searchQuery ? 'Try adjusting your search filters' : 'Enroll a student profile to populate directory'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-wider bg-white/[0.02]">
                  <th className="px-6 py-4">Avatar</th>
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Registration Photo Set</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((s) => {
                  const isEditing = editingStudentId === s._id;
                  return (
                    <tr key={s._id} className="hover:bg-white/[0.01] transition-all text-xs">
                      {/* Avatar */}
                      <td className="px-6 py-3.5">
                        <StudentAvatar
                          src={s.profilePictures[0]}
                          name={s.name}
                          className="h-10 w-10 rounded-xl"
                        />
                      </td>

                      {/* ID */}
                      <td className="px-6 py-3.5 font-mono text-gray-400">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.studentId}
                            onChange={(e) =>
                              setEditFormData((prev) => ({ ...prev, studentId: e.target.value }))
                            }
                            className="bg-white/5 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-accent-purple"
                          />
                        ) : (
                          s.studentId
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-6 py-3.5 font-bold text-white">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) =>
                              setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="bg-white/5 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-accent-purple"
                          />
                        ) : (
                          s.name
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-3.5 text-gray-400">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editFormData.email}
                            onChange={(e) =>
                              setEditFormData((prev) => ({ ...prev, email: e.target.value }))
                            }
                            className="bg-white/5 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-accent-purple"
                          />
                        ) : (
                          s.email
                        )}
                      </td>

                      {/* View angle photo set */}
                      <td className="px-6 py-3.5 text-center">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-[10px] font-bold border border-white/10 cursor-pointer inline-flex items-center gap-1.5 transition-all"
                        >
                          <Eye size={12} className="text-accent-purple" />
                          <span>View Angles (3)</span>
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-3.5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSaveEdit(s._id)}
                              className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 cursor-pointer"
                              title="Save Changes"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 rounded bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10 cursor-pointer"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleStartEdit(s)}
                              className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(s._id, s.name)}
                              className="p-1.5 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Picture Angles Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-2xl glass p-6 rounded-3xl relative flex flex-col border border-white/10 max-h-[90vh]">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute right-4 top-4 p-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-bold text-white text-left mb-1">
              {selectedStudent.name} ({selectedStudent.studentId})
            </h3>
            <p className="text-xs text-gray-400 text-left mb-6">Registered facial profile angles</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-y-auto">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Front Angle
                </span>
                <StudentAvatar
                  src={selectedStudent.profilePictures[0]}
                  name={selectedStudent.name}
                  className="rounded-xl w-full aspect-square text-lg"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Left Angle
                </span>
                <StudentAvatar
                  src={selectedStudent.profilePictures[1]}
                  name={selectedStudent.name}
                  className="rounded-xl w-full aspect-square text-lg"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Right Angle
                </span>
                <StudentAvatar
                  src={selectedStudent.profilePictures[2]}
                  name={selectedStudent.name}
                  className="rounded-xl w-full aspect-square text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
