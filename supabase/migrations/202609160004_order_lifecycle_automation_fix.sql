create or replace function public.handle_order_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  if new.status = 'shipped' and old.status is distinct from 'shipped' and new.shipped_at is null then
    new.shipped_at := now();
  end if;
  if new.status = 'delivered' and old.status is distinct from 'delivered' and new.delivered_at is null then
    new.delivered_at := now();
  end if;
  if (new.status = 'cancelled' or new.payment_status in ('failed','cancelled','expired')) and old.inventory_released_at is null then
    for r in select product_id, quantity from public.order_items where order_id = new.id loop
      if r.product_id is not null then
        update public.products set stock = stock + r.quantity, updated_at = now() where id = r.product_id;
      end if;
    end loop;
    new.inventory_released_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_order_lifecycle on public.orders;
create trigger trg_order_lifecycle before update on public.orders for each row execute function public.handle_order_lifecycle();
