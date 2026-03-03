import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function PageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-background-dark">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
                <Header />
                {children}
            </main>
        </div>
    );
}
