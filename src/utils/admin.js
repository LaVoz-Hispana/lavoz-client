export const isAdmin = (user) => Boolean(user?.is_admin) || user?.account_type === "admin";
