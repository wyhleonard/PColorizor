import { useEffect, useRef, useState } from "react";
import "./SelectButton.css";
import { colorToRGB } from "./utils";
import fillButtonIcon from "../icons/fillButton.svg";
import acceptButtonIcon from "../icons/acceptButton.svg";
import refuseButtonIcon from "../icons/refuseButton.svg";
import case2Restored1 from "../images/case2/restored1.jpg";
import case2Origin1 from "../images/case2/heatmap/o-1.jpg";
import case2Origin0 from "../images/case2/heatmap/o-0.jpg";
import { render } from "@testing-library/react";

export const SelectButton = ({ 
    canvasTop,
    ctxTop,
    ctxMid,
    ctxDown,
    canvasTemp,
    strokeRect,
    setStrokeRect,
    penColor,
    top, 
    left,
    display,
    setDisplay,
    mode,
    penData,
    setPenData,
    currentScale,
    source,
    setSource,
    setD,
    imageWH,
    imageLT,
    currentWH,
    setImageWH0,
    setImageWH1,
    setImageWH2,
    setImageWH3,
    setImageWH4,
    setImageLT0,
    setImageLT1,
    setImageLT2,
    setImageLT3,
    setImageLT4
}) => {
  const canvasSize = [300, 150];

  const [imageSrcs, setImageSrcs] = useState([]);

  const [isRestored, setIsRestored] = useState(false);

  const imageWidth = 3167;
  const imageHeight = 3083;

  const [autoInc, setAutoInc] = useState(0);

  const image = new Image();
  image.src = case2Origin0;

  const createButton = (idx, imgSrc, clickFunction) => {
    return (
        <button className="Select-Button"
        onClick={clickFunction}
        >
            <img className="Image" src={imgSrc} alt=""></img>
        </button>
    );
  };

  const imageDataToCanvas = (data) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = data.width;
    canvas.height = data.height;

    ctx.putImageData(data, 0, 0);
    return canvas;
  }

  const clearRect = () => {
    ctxTop.clearRect(0, 0, ...canvasSize);
    ctxMid.clearRect(0, 0, ...canvasSize);
    setStrokeRect([1000, 1000, 0, 0]);
  }

  const renderImages = () => {
    // const ctx = canvasTemp.current?.getContext('2d');
        source[autoInc] = imageSrcs[autoInc];
        setD('block');

        // const image = document.querySelectorAll(".Image");
        // console.log();

        const deltaX = strokeRect[2] - strokeRect[0];
        const deltaY = strokeRect[3] - strokeRect[1];

        if(autoInc === 0) {
            setImageWH0([deltaX * currentWH[0] / 300, deltaY * currentWH[1] / 150]);
        setImageLT0([(strokeRect[0] * currentWH[0] / 300), (strokeRect[1] * currentWH[1] / 150)]);
        }
        if(autoInc === 1) {
            setImageWH1([deltaX * currentWH[0] / 300, deltaY * currentWH[1] / 150]);
        setImageLT1([(strokeRect[0] * currentWH[0] / 300), (strokeRect[1] * currentWH[1] / 150)]);
        }
        if(autoInc === 2) {
            setImageWH2([deltaX * currentWH[0] / 300, deltaY * currentWH[1] / 150]);
        setImageLT2([(strokeRect[0] * currentWH[0] / 300), (strokeRect[1] * currentWH[1] / 150)]);
        }
        if(autoInc === 3) {
            setImageWH3([deltaX * currentWH[0] / 300, deltaY * currentWH[1] / 150]);
        setImageLT3([(strokeRect[0] * currentWH[0] / 300), (strokeRect[1] * currentWH[1] / 150)]);
        }
        if(autoInc === 4) {
            setImageWH4([deltaX * currentWH[0] / 300, deltaY * currentWH[1] / 150]);
        setImageLT4([(strokeRect[0] * currentWH[0] / 300), (strokeRect[1] * currentWH[1] / 150)]);
        }
        setAutoInc(autoInc + 1);
        console.log(autoInc);
  };

  const fetchAndShowImage = (canvas1, canvas2, color) => {
    renderImages();
    const formData = new FormData();

    // 使用Promise.all来等待多个异步操作完成
    Promise.all([
        new Promise((resolve, reject) => {
            canvas1.toBlob(
            (blob) => {
                formData.append('src_img', blob);
                resolve();
            },
            'image/jpeg',
            1
            );
        }),
        new Promise((resolve, reject) => {
            canvas2.toBlob(
            (blob) => {
                formData.append('ref_img', blob);
                resolve();
            },
            'image/jpeg',
            1
            );
        })
    ])
    .then(() => {
        const str = color === '' ? 'exemplar' : ('stroke?color=' + colorToRGB(penColor));
        // 所有异步操作完成后，发送fetch请求
        fetch('http://127.0.0.1:8000/' + str, {
        method: 'POST',
        body: formData,
        })
        .then(response => response.blob())
        .then(blob => {
            const imageURL = URL.createObjectURL(blob);
            URL.revokeObjectURL(blob);
            imageSrcs.push(imageURL);
            renderImages();
            setIsRestored(true);
        })
        .then((result) => {
            console.log('Success:', result);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
  }

  const fillButtonEvent = () => {
    //需要改，要变成那个不存在的canvas
    const widthScale = imageWidth / 300.0;
    const heightScale = imageHeight / 150.0;

    const x = strokeRect[0] * widthScale;
    const y = strokeRect[1] * heightScale;
    const deltaX = (strokeRect[2] - strokeRect[0]) * widthScale;
    const deltaY = (strokeRect[3] - strokeRect[1]) * heightScale;

    var paintingData = ctxDown.getImageData(x, y, deltaX, deltaY);
    const canvas1 = imageDataToCanvas(paintingData);

    if(mode === 0) {
        const data = ctxMid.getImageData(strokeRect[0], strokeRect[1],
            strokeRect[2] - strokeRect[0], strokeRect[3] - strokeRect[1]);
        penData = data;
    }
    console.log(penData);
    //从父传过来。
    const canvas2 = imageDataToCanvas(penData);

    ctxMid.clearRect(0, 0, ...canvasSize);
    const color = mode === 0 ? penColor : '';
    fetchAndShowImage(canvas1, canvas2, color);
  }

  const acceptButtonEvent = () => {
    clearRect();
    setIsRestored(false);
    setDisplay('none');
    setPenData([1]);
  };

  const refuseButtonEvent = () => {
    clearRect();
    // if (imageSrcs.length !== 0 && isRestored) {
    //     imageSrcs.pop();           //如果没有restore就直接狠心取消，我们需要避免这种情况带来的错误。
    // }
    setIsRestored(false);
    setDisplay('none');
    setPenData([1]);
  };

  return (
    <div className="Button-Container"
    style={{
        top: `${top}px`,
        left: `${left}px`,
        display: display
    }}>
        {createButton(0, fillButtonIcon, fillButtonEvent)}
        {createButton(1, acceptButtonIcon, acceptButtonEvent)}
        {createButton(2, refuseButtonIcon, refuseButtonEvent)}
    </div>
  );
};
