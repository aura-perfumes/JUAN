export const Clientes = {
  render: () => window.Dash?.renderClientes?.(),
  filter: value => window.Dash?.filterClientes?.(value)
};
