import DnaProfileLayout from "@/src/features/dnaProfile/components/DnaProfileLayout";
import React from "react";

export const metadata = {
  title: "DNA Profile",
};

export default function DNAProfileLayout({ children }: { children: React.ReactNode }) {
  return <DnaProfileLayout>{children}</DnaProfileLayout>;
}