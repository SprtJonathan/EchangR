import { useState, useEffect, useRef } from "react";

export default function SelectMenuButton(props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [style, setStyle] = useState(null);
  const contentRef = useRef(null);
  const toggleButtonRef = useRef(null);

  const handleMenuClick = () => {
    //console.log(menuOpen);
    setMenuOpen(!menuOpen);
  };

  const handleClickOutside = (event) => {
    if (
      contentRef.current &&
      !contentRef.current.contains(event.target) &&
      !toggleButtonRef.current.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    async function importStyle() {
      try {
        if (props.stylesFile) {
          const dynamicStyle = await import(`./${props.stylesFile}.module.css`);
          setStyle(dynamicStyle);
        } else {
          throw new Error("Default style");
        }
      } catch (error) {
        console.warn("Failed to import style, using default style");
        const defaultStyle = await import("./SelectMenuButton.module.css");
        setStyle(defaultStyle);
      }
    }

    importStyle();
  }, [props.stylesFile]);

  useEffect(() => {
    if (menuOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    } else {
      window.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  if (!style) return null;

  return (
    <div className={style.wrapper}>
      <button
        ref={toggleButtonRef}
        className={style.menuToggle}
        onClick={handleMenuClick}
      >
        {props.toggleText}
      </button>
      {menuOpen && (
        <div ref={contentRef} className={style.menu}>
          {props.content}
        </div>
      )}
    </div>
  );
}
