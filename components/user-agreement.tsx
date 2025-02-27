import React from "react";
import { H1, H2, H3 } from "./ui/typography";

const UserAgreement = () => {
  return (
    <div className="container">
      <div className="flex flex-row items-center justify-center p-3">
        <H2>Пользовательское Соглашение</H2>
      </div>
      <p>
        Настоящее Пользовательское Соглашение (далее Соглашение) регулирует
        отношения между владельцем roommatefinder.ru (далее RoommateFinder или
        Администрация) с одной стороны и пользователем сайта с другой.
      </p>
      <p>Сайт RoommateFinder не является средством массовой информации.</p>
      <p>
        Используя сайт, Вы соглашаетесь с условиями данного соглашения. Если Вы
        не согласны с условиями данного соглашения, не используйте сайт
        RoommateFinder!
      </p>

      <H3>Предмет соглашения</H3>
      <p>
        Администрация предоставляет пользователю право на размещение на сайте
        следующей информации:
      </p>
      <ul>
        <li>Текстовой информации</li>
        <li>Фотоматериалов</li>
        <li>Ссылок на материалы, размещенные на других сайтах</li>
      </ul>

      <H3>Права и обязанности сторон</H3>
      <p>
        <strong>Пользователь имеет право:</strong>
      </p>
      <ul>
        <li>осуществлять поиск информации на сайте</li>
        <li>получать информацию на сайте</li>
        <li>создавать информацию для сайта</li>
        <li>копировать информацию на другие сайты с указанием источника</li>
        <li>
          копировать информацию на другие сайты с разрешения правообладателя
        </li>
        <li>
          требовать от администрации скрытия любой информации о пользователе
        </li>
        <li>
          требовать от администрации скрытия любой информации переданной
          пользователем сайту
        </li>
        <li>использовать информацию сайта в личных некоммерческих целях</li>
      </ul>

      <p>
        <strong>Администрация имеет право:</strong>
      </p>
      <ul>
        <li>
          по своему усмотрению и необходимости создавать, изменять, отменять
          правила
        </li>
        <li>ограничивать доступ к любой информации на сайте</li>
      </ul>

      <p>
        <strong>Пользователь обязуется:</strong>
      </p>
      <ul>
        <li>обеспечить достоверность предоставляемой информации</li>
        <li>не нарушать работоспособность сайта</li>
        <li>
          не создавать несколько учётных записей на Сайте, если фактически они
          принадлежат одному и тому же лицу
        </li>
        <li>
          не использовать скрипты (программы) для автоматизированного сбора
          информации и/или взаимодействия с Сайтом и его Сервисами
        </li>
      </ul>

      <p>
        <strong>Администрация обязуется:</strong>
      </p>
      <ul>
        <li>
          поддерживать работоспособность сайта за исключением случаев, когда это
          невозможно по независящим от Администрации причинам
        </li>
      </ul>

      <H2>Ответственность сторон</H2>
      <ul>
        <li>
          пользователь лично несет полную ответственность за распространяемую им
          информацию
        </li>
        <li>
          администрация не несет никакой ответственности за достоверность
          информации, скопированной из других источников
        </li>
        <li>
          администрация не несёт ответственность за несовпадение ожидаемых
          Пользователем и реально полученных услуг
        </li>
        <li>
          администрация не несет никакой ответственности за услуги,
          предоставляемые третьими лицами
        </li>
        <li>
          в случае возникновения форс-мажорной ситуации (боевые действия,
          чрезвычайное положение, стихийное бедствие и т. д.) Администрация не
          гарантирует сохранность информации, размещённой Пользователем, а также
          бесперебойную работу информационного ресурса
        </li>
      </ul>

      <H2>Условия действия Соглашения</H2>
      <p>
        Данное Соглашение вступает в силу при регистрации на сайте. Соглашение
        перестает действовать при появлении его новой версии. Администрация
        оставляет за собой право в одностороннем порядке изменять данное
        соглашение по своему усмотрению. Администрация не оповещает
        пользователей об изменении в Соглашении.
      </p>
    </div>
  );
};

export default UserAgreement;
