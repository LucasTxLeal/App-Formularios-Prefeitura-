"use client";

import DynamicForm from "@/components/DynamicForm";
import { y96Schema } from "@/data/dynamicForms/y96";

export default function Y96Page() {
  return <DynamicForm schema={y96Schema} />;
}