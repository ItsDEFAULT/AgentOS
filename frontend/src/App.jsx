import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './views/Dashboard';
import Editor from './views/Editor';
import Fork from './views/Fork';
import Workflows from './views/Workflows';

function App() {
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);

  return (
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-2xl font-bold text-indigo-600">AgentOS</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <NavLink to="/" className={({ isActive }) => isActive ? "border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/editor" className={({ isActive }) => isActive ? "border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"}>
                    Editor
                  </NavLink>
                  <NavLink to="/fork" className={({ isActive }) => isActive ? "border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"}>
                    Fork
                  </NavLink>
                  <NavLink to="/workflows" className={({ isActive }) => isActive ? "border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"}>
                    Workflows
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                <Routes>
                  <Route path="/" element="Dashboard" />
                  <Route path="/editor" element="Workflow Editor" />
                  <Route path="/fork" element="Fork Workflow" />
                  <Route path="/workflows" element="All Workflows" />
                </Routes>
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
              <Routes>
                <Route path="/" element={<Dashboard currentWorkflowId={currentWorkflowId} setCurrentWorkflowId={setCurrentWorkflowId} />} />
                <Route path="/editor" element={<Editor />} />
                <Route path="/fork" element={<Fork />} />
                <Route path="/workflows" element={<Workflows />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
