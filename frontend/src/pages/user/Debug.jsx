import React from "react";

const Debug = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      <div className="bg-white p-4 rounded-lg space-y-4">
        <div>
          <p className="font-bold">Token:</p>
          <p className="text-sm break-all">{token ? token.substring(0, 50) + "..." : "NOT FOUND"}</p>
        </div>
        <div>
          <p className="font-bold">User:</p>
          <p className="text-sm break-all">{user ? user : "NOT FOUND"}</p>
        </div>
        <div>
          <p className="font-bold">Is Authenticated:</p>
          <p className="text-sm">{token && user && user !== "undefined" ? "YES ✅" : "NO ❌"}</p>
        </div>
      </div>
    </div>
  );
};

export default Debug;
