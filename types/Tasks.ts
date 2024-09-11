export type Tasks = {
    task_id: number;              // Primary Key
    task_details: string;         // Details about the task
    target_audience: string;      // The target audience for the task
    specific_additions: string;   // Any specific additions provided for the task
    assigned_date: string;        // Date assigned to this task, in the format YYYY-MM-DD
}
