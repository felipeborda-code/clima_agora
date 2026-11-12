const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
const RESOURCE = `${API_URL}/veiculos`;

async function request(path = "", options = {}) {
  let response;
  try {
    response = await fetch(`${RESOURCE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error("Não foi possível conectar à API. Verifique se o backend está em execução.");
  }

  if (response.status === 204) return null;
  const raw = await response.text();
  let data = null;
  if (raw) {
    try { data = JSON.parse(raw); }
    catch { data = raw; }
  }

  if (!response.ok) {
    const message = typeof data === "string"
      ? data
      : data?.message || data?.error || `Erro HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

export const veiculosApi = {
  listar: () => request(),
  buscarPorId: (id) => request(`/${encodeURIComponent(id)}`),
  criar: (veiculo) => request("", { method: "POST", body: JSON.stringify(veiculo) }),
  atualizar: (id, veiculo) => request(`/${encodeURIComponent(id)}`, {
    method: "PUT", body: JSON.stringify(veiculo)
  }),
  excluir: (id) => request(`/${encodeURIComponent(id)}`, { method: "DELETE" })
};