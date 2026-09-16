alter table public.orders
  add column if not exists inventory_released_at timestamptz;

create or replace function public.release_order_inventory(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
  v_released boolean := false;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;

  if v_order.inventory_released_at is not null then
    return jsonb_build_object('released', false, 'already_released', true);
  end if;

  if coalesce(v_order.status, '') <> 'cancelled' and coalesce(v_order.payment_status, '') not in ('failed','cancelled','expired') then
    raise exception 'Inventory can only be released for a cancelled or failed/expired order';
  end if;

  for v_item in select product_id, quantity from public.order_items where order_id = p_order_id loop
    if v_item.product_id is not null then
      update public.products
      set stock = stock + v_item.quantity,
          updated_at = now()
      where id = v_item.product_id;
    end if;
  end loop;

  update public.orders
  set inventory_released_at = now(), updated_at = now()
  where id = p_order_id;

  v_released := true;
  return jsonb_build_object('released', v_released, 'already_released', false);
end;
$$;

revoke all on function public.release_order_inventory(uuid) from public;
grant execute on function public.release_order_inventory(uuid) to service_role;
