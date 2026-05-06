create table if not exists client_companies (
    id bigserial primary key,
    name varchar(255),
    inn varchar(255),
    contact_person varchar(255),
    phone varchar(255),
    email varchar(255),
    city varchar(255)
);

create table if not exists app_users (
    id bigserial primary key,
    login varchar(255) not null,
    full_name varchar(255),
    email varchar(255) not null,
    phone varchar(255),
    password_hash varchar(255) not null,
    role varchar(255),
    active boolean not null,
    client_company_id bigint
);

create unique index if not exists uk_app_users_login on app_users (login);
create unique index if not exists uk_app_users_email on app_users (email);
create index if not exists idx_app_users_client_company_id on app_users (client_company_id);

create table if not exists production_orders (
    id bigserial primary key,
    order_number varchar(255) not null,
    title varchar(255) not null,
    description varchar(4000),
    status varchar(255),
    priority varchar(255),
    created_at date,
    planned_date date,
    due_date date,
    completed_at date,
    client_company_id bigint,
    manager_id bigint,
    executor_id bigint
);

create unique index if not exists uk_production_orders_order_number on production_orders (order_number);
create index if not exists idx_production_orders_client_company_id on production_orders (client_company_id);
create index if not exists idx_production_orders_manager_id on production_orders (manager_id);
create index if not exists idx_production_orders_executor_id on production_orders (executor_id);
create index if not exists idx_production_orders_status on production_orders (status);

create table if not exists order_comments (
    id bigserial primary key,
    order_id bigint,
    author_name varchar(255),
    author_role varchar(255),
    message varchar(255),
    visible_to_client boolean not null,
    created_at timestamp
);

create index if not exists idx_order_comments_order_id on order_comments (order_id);

create table if not exists order_status_history (
    id bigserial primary key,
    order_id bigint,
    status varchar(255),
    comment varchar(255),
    changed_by_name varchar(255),
    changed_by_role varchar(255),
    changed_at timestamp
);

create index if not exists idx_order_status_history_order_id on order_status_history (order_id);
