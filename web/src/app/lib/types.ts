export type RequestItem = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  assignee_name?: string | null;
};


export type AuditItem = {
  id: string;
  created_at: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  actor_id: string | null;
  before_json: Record<string, unknown> | null;
  after_json: Record<string, unknown> | null;
};

export type CommentItem = {
  id: string;
  request_id: string;
  author_id: string;
  message: string;
  created_at: string;
};
