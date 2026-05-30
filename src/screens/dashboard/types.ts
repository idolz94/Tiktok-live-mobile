export type CustomerSummary = {
  username: string;
  avatar?: string;
  totalComments: number;
  totalOrders: number;
  latestComment: string;
};

export type DashboardCounts = {
  comments: number;
  buying: number;
  orders: number;
};
