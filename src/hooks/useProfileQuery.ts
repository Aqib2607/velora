import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export function useProfileUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Need custom fetch for FormData to avoid JSON stringify
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/v1/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function usePasswordUpdate() {
  return useMutation({
    mutationFn: async (data: any) => {
      return apiFetch('POST', '/v1/profile/change-password', data);
    }
  });
}
