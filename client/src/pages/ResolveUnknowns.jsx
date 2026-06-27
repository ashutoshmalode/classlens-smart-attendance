import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAttendance, resolveUnknownFace } from '../store/slices/attendanceSlice.js';
import { fetchStudents } from '../store/slices/studentSlice.js';
import { Calendar, CheckCircle, ShieldAlert, UserCheck } from 'lucide-react';

const FaceCropImage = ({ src }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500 gap-1.5 p-4">
        <UserCheck size={28} className="text-gray-600" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Face Crop 404</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Cropped face"
      onError={() => setHasError(true)}
      className="max-h-full max-w-full object-contain"
    />
  );
};

export const ResolveUnknowns = () => {
  const dispatch = useDispatch();
  const { currentSession, loading, error } = useSelector((state) => state.attendance);
  const { list: students } = useSelector((state) => state.students);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudentIds, setSelectedStudentIds] = useState({}); // map unknownFaceId -> studentId
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch data
  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(getAttendance(date));
  }, [dispatch, date]);

  const handleDateChange = (e) => {
    setDate(e.target.value);
    setSuccessMsg('');
    dispatch(getAttendance(e.target.value));
  };

  const handleSelectStudent = (unknownFaceId, studentId) => {
    setSelectedStudentIds((prev) => ({
      ...prev,
      [unknownFaceId]: studentId,
    }));
  };

  const handleResolve = (unknownFaceId) => {
    const studentId = selectedStudentIds[unknownFaceId];
    if (!studentId) {
      alert('Please select a student to assign.');
      return;
    }

    dispatch(resolveUnknownFace({ date, unknownFaceId, studentId }))
      .unwrap()
      .then(() => {
        setSuccessMsg('Unknown face successfully resolved and marked present.');
        setTimeout(() => setSuccessMsg(''), 4000);
      })
      .catch((err) => {
        alert(`Failed to resolve unknown face: ${err}`);
      });
  };

  // Filter out resolved unknown faces
  const activeUnknowns = currentSession?.unknownFaces?.filter((u) => !u.assignedStudent) || [];

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white m-0">Resolve Unknowns</h2>
          <p className="text-gray-400 text-xs mt-1">
            Manually match unidentified face crops captured during classroom scans
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl self-start sm:self-auto">
          <Calendar size={16} className="text-accent-purple" />
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="bg-transparent text-sm text-white focus:outline-none border-none cursor-pointer"
          />
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 text-left">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 text-left">
          <ShieldAlert size={16} />
          <span>Resolution Error: {error}</span>
        </div>
      )}

      {activeUnknowns.length === 0 ? (
        <div className="glass p-16 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
            <UserCheck size={28} />
          </div>
          <h3 className="text-base font-bold text-white">All faces mapped for this date!</h3>
          <p className="text-xs text-gray-400 max-w-sm mt-1 leading-relaxed">
            There are no unresolved cropped faces found for {date}. Excellent!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeUnknowns.map((unk) => {
            const selectedStudentId = selectedStudentIds[unk._id] || '';
            
            return (
              <div key={unk._id} className="glass rounded-2xl border border-white/5 overflow-hidden flex flex-col hover:border-white/10 transition-all">
                {/* Crop view */}
                <div className="relative bg-[#0e0f14] aspect-square flex items-center justify-center border-b border-white/5">
                  <FaceCropImage src={unk.imageUrl} />
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 border border-white/10 rounded-md text-[9px] font-mono text-gray-400">
                    Photo {unk.photoIndex + 1}
                  </div>
                </div>

                {/* Resolution controls */}
                <div className="p-5 flex flex-col gap-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Assign to Student
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => handleSelectStudent(unk._id, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-purple"
                    >
                      <option value="" className="bg-[#11131c] text-gray-500">-- Select Student --</option>
                      {students.map((student) => (
                        <option
                          key={student._id}
                          value={student._id}
                          className="bg-[#11131c] text-white"
                        >
                          {student.name} ({student.studentId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleResolve(unk._id)}
                    disabled={!selectedStudentId || loading}
                    className="w-full py-2.5 bg-gradient-to-r from-accent-purple to-accent-pink disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserCheck size={14} />
                    <span>Resolve & Mark Present</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResolveUnknowns;
