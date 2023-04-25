import { useState } from "react";
import moment from "moment";
import "moment/locale/fr";

import styles from "./DateDisplay";

export default function DateDisplay(props) {
  const date = props.date;
  let dateColor = props.dateColor || "#888";

  const [dateToShow, setDateToShow] = useState(getTimeSincePost(date, true));
  const [dateCountdownFormat, setDateCountdownFormat] = useState(true);

  function getTimeSincePost(date, boolean) {
    let newDate = new Date(date);

    if (boolean) {
      newDate = moment(date).locale("fr").fromNow();
    } else {
      newDate = moment(date).format("DD/MM/YYYY - HH:mm");
    }
    return newDate;
  }

  function switchDateFormat() {
    setDateToShow(getTimeSincePost(date, !dateCountdownFormat)); // Mettre à jour dateToShow avec la nouvelle valeur formatée en JJ/MM/AAAA - HH:MM:SS ou "x temps depuis"
    setDateCountdownFormat(!dateCountdownFormat); // Inverser la valeur de dateCountdownFormat
  }

  return (
    <div
      className={styles.date}
      style={{ color: dateColor }}
      onClick={() => {
        switchDateFormat();
      }}
    >
      {dateToShow}
    </div>
  );
}
