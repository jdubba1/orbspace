"use client";

import Link from 'next/link';
import { prepopulatedManifestations } from '@/lib/manifestationData';
import { Clock, Plus, Sparkles, User, Settings } from 'lucide-react';

export default function MenuScreen() {
  const manifestations = Object.values(prepopulatedManifestations);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="p-6 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold font-mono italic">orb.space</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
            <Settings size={20} />
          </button>
          <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
            <User size={20} />
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold">Your Manifestations</h2>
          <Link 
            href="/manifestations/new"
            className="px-4 py-2 bg-indigo-600 rounded-md flex items-center space-x-2 hover:bg-indigo-700 transition duration-200"
          >
            <Plus size={16} />
            <span>New Manifestation</span>
          </Link>
        </div>
        
        {/* Manifestation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {manifestations.map(manifestation => (
            <Link 
              href={`/manifestations/${manifestation.id}`} 
              key={manifestation.id}
              className="bg-gray-800 bg-opacity-50 rounded-lg p-5 hover:bg-opacity-70 transition duration-200 border border-gray-700"
            >
              <div className="mb-2 flex justify-between items-start">
                <h3 className="text-lg font-semibold">{manifestation.name}</h3>
                <span className="text-xs bg-indigo-800 px-2 py-1 rounded-full">
                  {Object.keys(manifestation.levels).length} levels
                </span>
              </div>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {manifestation.description || 'No description provided.'}
              </p>
              
              {/* Active Operations Indicator */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Clock size={14} />
                  <span>{new Date(manifestation.updatedAt).toLocaleDateString()}</span>
                </div>
                
                {/* Check if any operations are running */}
                {Object.values(manifestation.levels).some(level => 
                  level.operationSettings.isRunning
                ) ? (
                  <div className="flex items-center text-emerald-400 text-sm">
                    <Sparkles size={14} className="mr-1" />
                    <span>Active</span>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Inactive</div>
                )}
              </div>
            </Link>
          ))}
        </div>
        
        {manifestations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">You haven&apos;t created any manifestations yet.</p>
            <Link 
              href="/manifestations/new"
              className="px-4 py-2 bg-indigo-600 rounded-md inline-flex items-center space-x-2 hover:bg-indigo-700 transition duration-200"
            >
              <Plus size={16} />
              <span>Create Your First Manifestation</span>
            </Link>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="p-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>orb.space - Manifest your intentions through cosmic alignment.</p>
      </footer>
    </div>
  );
}