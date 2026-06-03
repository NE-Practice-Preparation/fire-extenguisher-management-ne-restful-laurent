export type ChartDataItem = {
  label: string
  rejected: number
  approved: number
  pending: number
}

export const chartData: Record<string, ChartDataItem[]> = {
  "12 Months": [
    { label: "Jan", rejected: 6, approved: 5, pending: 4 },
    { label: "Feb", rejected: 8, approved: 6, pending: 5 },
    { label: "Mar", rejected: 4, approved: 4, pending: 3 },
    { label: "Apr", rejected: 6, approved: 6, pending: 6 },
    { label: "May", rejected: 4, approved: 4, pending: 3 },
    { label: "Jun", rejected: 7, approved: 6, pending: 5 },
    { label: "Jul", rejected: 6, approved: 5, pending: 6 },
    { label: "Aug", rejected: 6, approved: 6, pending: 6 },
    { label: "Sep", rejected: 6, approved: 5, pending: 6 },
    { label: "Oct", rejected: 6, approved: 6, pending: 5 },
    { label: "Nov", rejected: 7, approved: 5, pending: 5 },
    { label: "Dec", rejected: 7, approved: 7, pending: 5 },
  ],
  "30 Days": Array.from({ length: 30 }, (_, index) => ({
    label: `${index + 1}`,
    rejected: (index % 5) + 2,
    approved: (index % 6) + 3,
    pending: (index % 4) + 2,
  })),
  "7 Days": [
    { label: "Mon", rejected: 2, approved: 2, pending: 1 },
    { label: "Tue", rejected: 3, approved: 1, pending: 3 },
    { label: "Wed", rejected: 2, approved: 4, pending: 2 },
    { label: "Thu", rejected: 4, approved: 2, pending: 2 },
    { label: "Fri", rejected: 5, approved: 3, pending: 1 },
    { label: "Sat", rejected: 1, approved: 1, pending: 1 },
    { label: "Sun", rejected: 1, approved: 0, pending: 1 },
  ],
  "24 Hours": Array.from({ length: 24 }, (_, index) => ({
    label: `${String(index).padStart(2, "0")}h`,
    rejected: (index % 3) + 1,
    approved: (index % 4) + 1,
    pending: (index % 2) + 1,
  })),
}

export const categoryBreakdown = [
  { name: "Lorem ipsum category", value: 45, color: "#BE123C" },
  { name: "Dolor sit amet", value: 25, color: "#59A8FF" },
  { name: "Consectetur module", value: 15, color: "#84C3FF" },
  { name: "Adipiscing elit", value: 10, color: "#D1E9FF" },
  { name: "Sed do eiusmod", value: 5, color: "#EFF8FF" },
]

export const requestedModules = [
  { id: "#1", name: "Lorem Ipsum", percentage: 10.3 },
  { id: "#2", name: "Dolor Sit Amet", percentage: 8.3 },
  { id: "#3", name: "Consectetur Adipiscing", percentage: 8.0 },
  { id: "#4", name: "Tempor Incididunt", percentage: 4.02 },
  { id: "#5", name: "Ut Labore", percentage: 3.4 },
]

export const tableRecords = [
  {
    id: "1",
    requester: { name: "Lorem Ipsum", email: "lorem.ipsum@example.com", avatar: "LI" },
    organization: { name: "Dolor Studio", website: "dolor.example", logo: "DS" },
    category: { name: "Template Item", group: "TMP" },
    status: "Pending",
    stage: "Initial Review",
    submittedOn: "19/12/2025 2:00 PM",
    location: "US",
  },
  {
    id: "2",
    requester: { name: "Dolor Amet", email: "dolor.amet@example.com", avatar: "DA" },
    organization: { name: "Ipsum Works", website: "ipsum.example", logo: "IW" },
    category: { name: "Reusable Module", group: "MOD" },
    status: "Approved",
    stage: "Completed",
    submittedOn: "18/12/2025 11:30 AM",
    location: "AU",
  },
  {
    id: "3",
    requester: { name: "Sit Elit", email: "sit.elit@example.com", avatar: "SE" },
    organization: { name: "Amet Labs", website: "amet.example", logo: "AL" },
    category: { name: "Workflow Entry", group: "WRK" },
    status: "Rejected",
    stage: "Rejected",
    submittedOn: "17/12/2025 9:15 AM",
    location: "UK",
  },
]
