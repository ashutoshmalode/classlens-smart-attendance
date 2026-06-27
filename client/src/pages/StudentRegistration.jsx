import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addStudent, resetStudentState } from '../store/slices/studentSlice.js';
import { User, Mail, UploadCloud, CheckCircle, ShieldAlert } from 'lucide-react';

export const StudentRegistration = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.students);

  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Image files states
  const [images, setImages] = useState({
    frontImage: null,
    leftImage: null,
    rightImage: null,
  });

  // Previews
  const [previews, setPreviews] = useState({
    frontImage: '',
    leftImage: '',
    rightImage: '',
  });

  useEffect(() => {
    if (success) {
      // Clear form
      setStudentId('');
      setName('');
      setEmail('');
      setImages({ frontImage: null, leftImage: null, rightImage: null });
      setPreviews({ frontImage: '', leftImage: '', rightImage: '' });
      setTimeout(() => dispatch(resetStudentState()), 5000);
    }
  }, [success, dispatch]);

  const handleImageChange = (angle, e) => {
    const file = e.target.files[0];
    if (file) {
      setImages((prev) => ({ ...prev, [angle]: file }));
      setPreviews((prev) => ({ ...prev, [angle]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!images.frontImage || !images.leftImage || !images.rightImage) {
      alert('Please upload all three angles (Front, Left, Right)');
      return;
    }

    const formData = new FormData();
    formData.append('studentId', studentId.trim());
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    formData.append('frontImage', images.frontImage);
    formData.append('leftImage', images.leftImage);
    formData.append('rightImage', images.rightImage);

    dispatch(addStudent(formData));
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col gap-6 md:gap-8">
      <div>
        <h2 className="text-2xl font-extrabold text-white m-0">Student Registration</h2>
        <p className="text-gray-400 text-xs mt-1">
          Enroll new student with multi-angle facial feature extractions
        </p>
      </div>

      <div className="max-w-4xl glass p-4 sm:p-6 md:p-8 rounded-3xl border border-white/5 mx-auto w-full">
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-4 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2">
            <CheckCircle size={16} />
            <span>Student profile registered and averaged 128-float facial vector saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>Registration Failed: {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Section 1: Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Student ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="STU2026101"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ashutosh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="ashutosh@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 my-2" />

          {/* Section 2: Face Angles */}
          <div>
            <h3 className="text-sm font-bold text-white text-left mb-1">Upload Face Angles</h3>
            <p className="text-left text-gray-400 text-xs mb-6">
              Please upload high quality photos with good illumination showing three distinct head poses.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Front angle */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-gray-300">Front Profile Pose</label>
                <div className="border border-dashed border-white/10 rounded-2xl relative h-40 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center p-4">
                  {previews.frontImage ? (
                    <img
                      src={previews.frontImage}
                      alt="Front Preview"
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                      <UploadCloud size={24} />
                      <span className="text-[10px]">Click to upload front view</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => handleImageChange('frontImage', e)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              {/* Left Angle */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-gray-300">Left Profile Pose</label>
                <div className="border border-dashed border-white/10 rounded-2xl relative h-40 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center p-4">
                  {previews.leftImage ? (
                    <img
                      src={previews.leftImage}
                      alt="Left Preview"
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                      <UploadCloud size={24} />
                      <span className="text-[10px]">Click to upload left profile</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => handleImageChange('leftImage', e)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              {/* Right Angle */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-gray-300">Right Profile Pose</label>
                <div className="border border-dashed border-white/10 rounded-2xl relative h-40 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center p-4">
                  {previews.rightImage ? (
                    <img
                      src={previews.rightImage}
                      alt="Right Preview"
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                      <UploadCloud size={24} />
                      <span className="text-[10px]">Click to upload right profile</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => handleImageChange('rightImage', e)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto md:self-end px-8 py-3.5 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Extracting Facial Features & Compiling average template...</span>
              </>
            ) : (
              <span>Enroll Student Profile</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;
