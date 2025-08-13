"use client";
import React from "react";
import Chatbot from "@/app/components/Chat";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">AI Assistant</h1>
        <Chatbot />
      </div>
    </div>
  );
}
