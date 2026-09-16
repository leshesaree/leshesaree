-- Automatically release reserved inventory when an order becomes cancelled
-- or its payment becomes failed/cancelled/expired.
-- Paid orders are intentionally not released merely because an admin changes
-- the fulfillment status to cancelled; refund handling remains explicit.

create or replace function public.orders_inventory_release_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    (new.status = 'cancelled' and new.payment_status <> 'paid')
    or new.payment_status in ('failed', 'cancelled', 'expired')
  ) then
    perform public.release_order_inventory(new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_orders_inventory_release on public.orders;

create trigger trg_orders_inventory_release
after update of status, payment_status on public.orders
for each row
execute function public.orders_inventory_release_trigger();
