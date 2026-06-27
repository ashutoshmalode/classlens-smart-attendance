import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { runClassroomScan, resetAttendanceState } from '../store/slices/attendanceSlice.js';
import FaceBoundingBoxCanvas from '../components/FaceBoundingBoxCanvas.jsx';
import { Calendar, UploadCloud, Sliders, CheckCircle, HelpCircle, FileImage, ShieldAlert } from 'lucide-react';

export const AttendanceSession = () => {
  const dispatch = useDispatch();
  const { currentSession, statistics, loading, error, scanSuccess } = useSelector(
    (state) => state.attendance
  );

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [threshold, setThreshold] = useState(0.6);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  // Selected classroom image tab to preview overlay canvas
  const [activePhotoTab, setActivePhotoTab] = useState(0);

  useEffect(() => {
    if (scanSuccess) {
      setFiles([]);
      setPreviews([]);
      setActivePhotoTab(0);
      setTimeout(() => dispatch(resetAttendanceState()), 5000);
    }
  }, [scanSuccess, dispatch]);

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    
    // Enforce limit of 10
    const limitedFiles = uploadedFiles.slice(0, 10 - files.length);
    const newFiles = [...files, ...limitedFiles];
    
    setFiles(newFiles);
    
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleClear = () => {
    setFiles([]);
    setPreviews([]);
    dispatch(resetAttendanceState());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please upload at least one classroom image');
      return;
    }

    const formData = new FormData();
    formData.append('date', date);
    formData.append('threshold', threshold);
    
    files.forEach((file) => {
      formData.append('classroomPhotos', file);
    });

    dispatch(runClassroomScan(formData));
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col gap-6 md:gap-8">
      <div>
        <h2 className="text-2xl font-extrabold text-white m-0">Attendance Scanner</h2>
        <p className="text-gray-400 text-xs mt-1">
          Upload up to 10 multi-angle classroom photos to run face detection models
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: upload form & parameters */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass p-6 rounded-3xl border border-white/5 text-left flex flex-col gap-5">
            <h3 className="text-sm font-bold text-white mb-2">Scan Parameters</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Attendance Date
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                <Calendar size={14} className="text-accent-purple" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none border-none cursor-pointer w-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Euclidean Threshold
                </label>
                <span className="text-xs font-mono font-bold text-accent-purple">
                  {threshold.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <Sliders size={14} className="text-gray-500" />
                <input
                  type="range"
                  min="0.40"
                  max="0.80"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-purple"
                />
              </div>
              <span className="text-[9px] text-gray-500 mt-1 leading-normal">
                Lower value (e.g. 0.5) is strict, reducing false positives. Higher value is lenient.
              </span>
            </div>

            <div className="border-t border-white/5 my-1" />

            {/* Drag & drop or upload selection */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Upload Classroom Photos
              </label>
              
              <div className="border border-dashed border-white/10 rounded-2xl relative h-36 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center gap-2 text-gray-500 text-center">
                  <UploadCloud size={28} className="text-gray-400" />
                  <span className="text-[10px] font-semibold text-white">Choose class images</span>
                  <span className="text-[9px]">Select up to 10 files (JPG/PNG)</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            {files.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">
                    Queue ({files.length}/10)
                  </span>
                  <button
                    onClick={handleClear}
                    className="text-[10px] text-pink-400 font-bold hover:underline cursor-pointer bg-transparent border-none"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1 bg-white/[0.02] rounded-lg border border-white/5">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded-md text-[9px] text-white"
                    >
                      <FileImage size={10} className="text-accent-purple" />
                      <span className="truncate max-w-[80px]">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || files.length === 0}
              className="w-full py-3 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Processing neural face model...</span>
                </>
              ) : (
                <span>Run Classroom Scanner</span>
              )}
            </button>
          </div>
        </div>

        {/* Right column: bounding box canvas overlay and scan stats */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 text-left">
              <ShieldAlert size={16} />
              <span>Session Processing Failed: {error}</span>
            </div>
          )}

          {scanSuccess && statistics && (
            <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-4 text-left">
              <CheckCircle size={18} />
              <div>
                <p className="font-bold">Face recognition scan complete!</p>
                <p className="text-[10px] mt-0.5 text-emerald-500/80">
                  Detected and registered: Present: {statistics.present} | Absent: {statistics.absent} | Crops generated: {statistics.unknown}
                </p>
              </div>
            </div>
          )}

          {currentSession && currentSession.classPhotos?.length > 0 ? (
            <div className="flex flex-col gap-4">
              {/* Photo selector tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {currentSession.classPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoTab(idx)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                      activePhotoTab === idx
                        ? 'bg-accent-purple/10 border-accent-purple text-white'
                        : 'bg-white/5 border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    Classroom Photo {idx + 1}
                  </button>
                ))}
              </div>

              {/* Bounded highlight canvas */}
              <div className="glass p-4 rounded-2xl border border-white/5">
                <FaceBoundingBoxCanvas
                  imageUrl={currentSession.classPhotos[activePhotoTab]}
                  photoIndex={activePhotoTab}
                  records={currentSession.records}
                  unknownFaces={currentSession.unknownFaces}
                />
              </div>
            </div>
          ) : (
            <div className="glass p-12 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mb-4 animate-pulse">
                <FileImage size={28} />
              </div>
              <h3 className="text-base font-bold text-white">No active visual canvas overlays</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1 leading-relaxed">
                Upload classroom images and execute the scanner models to view face detection boundaries and bounding box outlines.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSession;
