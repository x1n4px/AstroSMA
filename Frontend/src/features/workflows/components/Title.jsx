import React, { useEffect, useState } from "react";

const Title = ({ titleText, subtitleText, onChange }) => {
    const [title, setTitle] = useState(titleText || "Haz clic para editar el título");
    const [subtitle, setSubtitle] = useState(subtitleText || "Añade un subtítulo o contexto para esta sección");

    useEffect(() => {
        if (typeof titleText === "string") {
            setTitle(titleText);
        }
    }, [titleText]);

    useEffect(() => {
        if (typeof subtitleText === "string") {
            setSubtitle(subtitleText);
        }
    }, [subtitleText]);

    return (
        <div className="workflow-title-block">
            <h2
                className="exportable-content title-text workflow-title-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    const newTitle = e.target.innerText;
                    setTitle(newTitle);
                    if (onChange) {
                        onChange({ titleText: newTitle, subtitleText: subtitle });
                    }
                }}
            >
                {title}
            </h2>
            <h4
                className="exportable-content subtitle-text workflow-subtitle-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    const newSubtitle = e.target.innerText;
                    setSubtitle(newSubtitle);
                    if (onChange) {
                        onChange({ titleText: title, subtitleText: newSubtitle });
                    }
                }}
            >
                {subtitle}
            </h4>
        </div>
    );
};

export default Title;
