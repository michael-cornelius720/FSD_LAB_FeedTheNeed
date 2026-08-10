import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5001/api/fs';

const TEMPLATES = {
  donation: {
    filename: 'donation_receipt_01.txt',
    content: `FEED THE NEED - SURPLUS FOOD DONATION RECEIPT
===============================================
Date: ${new Date().toLocaleDateString()}
Donation ID: DN-9021-X
Donor Name: Green Leaf Restaurant
Food Type: Prepared Meals (Rice & Veg Curry)
Quantity: 45 Portions
Urgency: High (Consume within 3 hours)
Location: 12 Baker St, Downtown
Status: Verified by Admin

-----------------------------------------------
Notes: Safely packed in thermal containers.
Server Path: /server/domain-files/donation_receipt_01.txt
===============================================`
  },
  volunteer: {
    filename: 'volunteer_dispatch_log.txt',
    content: `FEED THE NEED - VOLUNTEER DISPATCH REGISTER
===============================================
Date: ${new Date().toLocaleDateString()}
Log Type: Shift Dispatch Logs
Volunteer Assigned: Rajesh Kumar
Contact: +91 98765 43210
Vehicle: Honda Activa (Two-Wheeler)
Assigned Route: Sector 4 Food Hub -> NGO Center 2
Status: Dispatched / Out for Pick Up

-----------------------------------------------
System Log: fs.promises.appendFile triggers on state change.
===============================================`
  },
  ngo: {
    filename: 'ngo_weekly_report.txt',
    content: `FEED THE NEED - NGO PERFORMANCE SUMMARY
===============================================
Period: Weekly Audit Report
Total Recovered Food: 520 kg
Successful Deliveries: 124 dispatches
Active Volunteers: 18 members
Waste Prevented: ~480 CO2 equivalents (kg)

-----------------------------------------------
Generated Automatically. Protected Server Audit File.
===============================================`
  },
  custom: {
    filename: 'custom_log.txt',
    content: `// FeedTheNeed Custom Domain Log File
Created on: ${new Date().toString()}
Domain Specific Details: Write your custom text here...`
  }
};

export default function FileSystemDemo() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFileName, setNewFileName] = useState(TEMPLATES.donation.filename);
  const [newFileContent, setNewFileContent] = useState(TEMPLATES.donation.content);
  const [selectedTemplate, setSelectedTemplate] = useState('donation');
  const [logs, setLogs] = useState([]);
  const [renameInput, setRenameInput] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isAppend, setIsAppend] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add console log entries
  const addLog = (action, method, status, details) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, action, method, status, details }, ...prev]);
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_BASE}/list`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
        addLog('List Files', 'fs.readdir() / fs.stat()', 'Success', `Found ${data.length} files`);
      } else {
        const error = await response.json();
        setErrorMsg(error.error || 'Failed to list files');
        addLog('List Files', 'fs.readdir()', 'Failed', error.error || '');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error connecting to backend server.');
      addLog('List Files', 'fs.readdir()', 'Failed', 'Connection Error');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleTemplateChange = (e) => {
    const type = e.target.value;
    setSelectedTemplate(type);
    setNewFileName(TEMPLATES[type].filename);
    setNewFileContent(TEMPLATES[type].content);
  };

  // 1. CREATE & WRITE FILE (POST)
  const handleCreateFile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newFileName.trim()) {
      setErrorMsg('Please specify a filename');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: newFileName, content: newFileContent })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(data.message);
        addLog('Create File', 'fs.writeFile()', 'Success', `Created ${newFileName}`);
        fetchFiles();
        // Reset or select the newly created file
        handleReadFile(newFileName);
      } else {
        setErrorMsg(data.error);
        addLog('Create File', 'fs.writeFile()', 'Failed', data.error);
      }
    } catch (err) {
      setErrorMsg('Failed to communicate with server.');
      addLog('Create File', 'fs.writeFile()', 'Failed', err.message);
    }
  };

  // 2. READ FILE (GET)
  const handleReadFile = async (filename) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_BASE}/read/${filename}`);
      const data = await response.json();
      if (response.ok) {
        setSelectedFile(data);
        setEditContent(data.content);
        setRenameInput(data.filename);
        addLog('Read File', 'fs.readFile()', 'Success', `Loaded ${filename}`);
      } else {
        setErrorMsg(data.error);
        addLog('Read File', 'fs.readFile()', 'Failed', data.error);
      }
    } catch (err) {
      setErrorMsg('Failed to fetch file content.');
      addLog('Read File', 'fs.readFile()', 'Failed', err.message);
    }
  };

  // 3. UPDATE FILE (PUT)
  const handleUpdateFile = async () => {
    if (!selectedFile) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE}/update/${selectedFile.filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent, append: isAppend })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(data.message);
        const methodUsed = isAppend ? 'fs.appendFile()' : 'fs.writeFile()';
        addLog('Update File', methodUsed, 'Success', `Updated ${selectedFile.filename}`);
        fetchFiles();
        // Reload details
        handleReadFile(selectedFile.filename);
      } else {
        setErrorMsg(data.error);
        addLog('Update File', 'fs.writeFile()', 'Failed', data.error);
      }
    } catch (err) {
      setErrorMsg('Failed to update file.');
      addLog('Update File', 'fs.writeFile()', 'Failed', err.message);
    }
  };

  // 4. RENAME FILE (POST)
  const handleRenameFile = async () => {
    if (!selectedFile || !renameInput.trim()) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE}/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldFilename: selectedFile.filename, newFilename: renameInput })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(data.message);
        addLog('Rename File', 'fs.rename()', 'Success', `Renamed ${selectedFile.filename} to ${renameInput}`);
        const newName = renameInput;
        fetchFiles();
        handleReadFile(newName);
      } else {
        setErrorMsg(data.error);
        addLog('Rename File', 'fs.rename()', 'Failed', data.error);
      }
    } catch (err) {
      setErrorMsg('Failed to rename file.');
      addLog('Rename File', 'fs.rename()', 'Failed', err.message);
    }
  };

  // 5. DELETE FILE (DELETE)
  const handleDeleteFile = async (filename) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${filename}"?`)) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE}/delete/${filename}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(data.message);
        addLog('Delete File', 'fs.unlink()', 'Success', `Deleted ${filename}`);
        setSelectedFile(null);
        fetchFiles();
      } else {
        setErrorMsg(data.error);
        addLog('Delete File', 'fs.unlink()', 'Failed', data.error);
      }
    } catch (err) {
      setErrorMsg('Failed to delete file.');
      addLog('Delete File', 'fs.unlink()', 'Failed', err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-fadeIn">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          File System (FS) Integration Demo
        </h1>
        <p className="text-slate-600 mt-2 max-w-3xl text-sm leading-relaxed">
          Demonstrate server-side Node.js File System operations securely from the React client.
          The browser client fires HTTP API requests via fetch to trigger safe filesystem commands on the host machine.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded text-rose-800 text-sm font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded text-green-800 text-sm font-medium">
          ✓ {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Explorer & File Creation */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* File Explorer list */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                📁 File Explorer
                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                  server/domain-files/
                </span>
              </h2>
              <button
                onClick={fetchFiles}
                className="p-1.5 text-slate-500 hover:text-green-600 rounded-md hover:bg-slate-50 transition"
                title="Refresh File List"
              >
                🔄
              </button>
            </div>

            {files.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                <p className="text-xs text-slate-400 font-medium">No domain files found.</p>
                <p className="text-[11px] text-slate-400 mt-1">Use the writer tool below to create one!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className={`py-3 flex items-center justify-between group cursor-pointer transition ${
                      selectedFile?.filename === file.name ? 'bg-green-50/40 px-2 rounded-lg' : ''
                    }`}
                    onClick={() => handleReadFile(file.name)}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {(file.size / 1024).toFixed(2)} KB • {new Date(file.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.name);
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition"
                        title="Delete (fs.unlink)"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create File Form */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
              ✍️ Write / Create File
            </h2>

            <form onSubmit={handleCreateFile} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                  Select Domain Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={handleTemplateChange}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none focus:border-green-500 text-slate-700"
                >
                  <option value="donation">Donation Receipt Template</option>
                  <option value="volunteer">Volunteer Dispatch Log</option>
                  <option value="ngo">NGO Audit Summary</option>
                  <option value="custom">Blank Custom File</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                  Filename
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full text-sm font-mono border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-green-500 text-slate-800"
                  placeholder="e.g. log.txt"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                  Content Body
                </label>
                <textarea
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  rows="6"
                  className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-green-500 text-slate-800 leading-relaxed"
                  placeholder="File content..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>Write File</span>
                <span className="text-[10px] font-mono bg-green-500/50 px-1.5 py-0.5 rounded">fs.writeFile</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: File Content Viewer & Operations Log */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* File Viewer / Editor */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex-1 min-h-[300px] flex flex-col">
            <h2 className="text-md font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span>📖 File Editor & Viewer</span>
              {selectedFile && (
                <span className="text-xs bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-full border border-green-100">
                  Active: {selectedFile.filename}
                </span>
              )}
            </h2>

            {!selectedFile ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                <span className="text-3xl mb-2">📄</span>
                <p className="text-xs font-medium">No file selected</p>
                <p className="text-[11px] mt-1 text-slate-400">Click a file from the explorer to view, edit, or delete it.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5 flex-1 justify-between">
                
                {/* Edit File Textarea */}
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Live File Content
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full flex-1 min-h-[220px] text-xs font-mono border border-slate-200 rounded-lg p-3 bg-slate-50 focus:outline-none focus:border-green-500 text-slate-800 leading-relaxed"
                  />
                </div>

                {/* Operation controls */}
                <div className="border-t border-slate-100 pt-4 flex flex-col gap-4">
                  
                  {/* Append vs Overwrite Option */}
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Update Mode:</span>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="updateMode"
                        checked={!isAppend}
                        onChange={() => setIsAppend(false)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      Overwrite (fs.writeFile)
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="updateMode"
                        checked={isAppend}
                        onChange={() => setIsAppend(true)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      Append (fs.appendFile)
                    </label>
                  </div>

                  {/* Update / Save Button */}
                  <button
                    onClick={handleUpdateFile}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <span>Save Changes</span>
                    <span className="text-[9px] font-mono bg-slate-700 px-1 rounded">
                      {isAppend ? 'fs.appendFile' : 'fs.writeFile'}
                    </span>
                  </button>

                  <hr className="border-slate-100" />

                  {/* Rename File Section */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Rename File
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={renameInput}
                        onChange={(e) => setRenameInput(e.target.value)}
                        className="flex-1 text-xs font-mono border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                        placeholder="new_name.txt"
                      />
                      <button
                        onClick={handleRenameFile}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition flex items-center gap-1.5"
                      >
                        <span>Rename</span>
                        <span className="text-[9px] font-mono text-slate-400">fs.rename</span>
                      </button>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Delete button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteFile(selectedFile.filename)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg text-xs transition flex items-center gap-1.5"
                    >
                      <span>Delete File</span>
                      <span className="text-[9px] font-mono bg-rose-200/50 px-1 rounded">fs.unlink</span>
                    </button>
                  </div>

                </div>

              </div>
            )}
          </div>

          {/* FS Activity Terminal */}
          <div className="bg-slate-900 rounded-xl shadow-md p-6 text-slate-100 font-mono text-xs flex flex-col h-60">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-[10px] text-slate-400 ml-2 font-bold uppercase tracking-widest">
                  Backend System Logger
                </span>
              </div>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-bold"
              >
                CLEAR LOGS
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-center py-10">
                  // No operations executed in this session yet.
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="border-b border-slate-800/40 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-semibold">
                        [{log.time}] {log.action}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        log.status === 'Success' ? 'bg-green-950/60 text-green-400 border border-green-900/50' : 'bg-rose-950/60 text-rose-400 border border-rose-900/50'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="text-slate-400 mt-1 flex justify-between">
                      <span>Method: <code className="text-amber-400">{log.method}</code></span>
                      <span className="text-slate-500 text-[10px] truncate max-w-[250px]">{log.details}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
