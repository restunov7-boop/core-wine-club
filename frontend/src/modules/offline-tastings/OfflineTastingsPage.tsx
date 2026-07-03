import { Link } from "react-router-dom";

export function OfflineTastingsPage() {
  return (
    <section className="offline-tastings-page">
      <header className="offline-tastings-hero">
        <span>Скоро</span>
        <h1>Офлайн-дегустации</h1>
        <p>Встречи, вино и спокойное знакомство со вкусами. Пока это только витрина будущего раздела без оплаты и брони.</p>
        <Link className="primary-action" to="/home">
          На главную
        </Link>
      </header>
      <section className="offline-tastings-note">
        <h2>Где потом появятся реальные данные</h2>
        <p>
          Когда клуб будет готов к встречам, сюда можно подключить frontend data/API для дат, мест, вместимости и
          статусов. Booking logic и платежи в этом спринте не добавлялись.
        </p>
      </section>
    </section>
  );
}
