"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatShortDate } from "@/lib/planner/dates";
import type { UploadedDoc } from "@/lib/planner/dashboard";

const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });

const SAMPLE_PDF_URL = "/sample-contract.pdf";
