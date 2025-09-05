import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
const CameraStream = forwardRef(
  (
    {
      width = 320,
      height = 240,
      facingMode = "user",
      deviceId,
      mirrored,
      fit = "cover",
      className,
      style,
      onError,
      onStream,
      constraints = {},
    },
    ref
  ) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const facingRef = useRef(facingMode);

    const stop = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const start = async () => {
      try {
        stop();
        const base = deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: facingRef.current } };

        // Fixed dimensions hint
        const sizeHints = {
          width: typeof width === "number" ? { ideal: width } : undefined,
          height: typeof height === "number" ? { ideal: height } : undefined,
        };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { ...base, ...sizeHints, ...constraints },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // iOS/Safari friendliness
          await videoRef.current.play().catch(() => {});
        }
        onStream && onStream(stream);
      } catch (err) {
        onError && onError(err);
        // eslint-disable-next-line no-console
        console.error("Camera start failed:", err);
      }
    };

    const switchCamera = async () => {
      if (deviceId) return; // not applicable if a specific device is forced
      facingRef.current = facingRef.current === "user" ? "environment" : "user";
      await start();
    };

    useImperativeHandle(ref, () => ({
      start,
      stop,
      switchCamera,
      getStream: () => streamRef.current || null,
    }));

    useEffect(() => {
      // Keep facingRef in sync if prop changes
      facingRef.current = facingMode;
    }, [facingMode]);

    useEffect(() => {
      start();
      return stop; // cleanup on unmount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deviceId, constraints, width, height]); // restart if these change

    const resolvedMirrored =
      typeof mirrored === "boolean" ? mirrored : facingMode === "user";

    const containerStyle = {
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
      position: "relative",
      overflow: "hidden",
      background: "#000",
      ...style,
    };

    const videoStyle = {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: fit, // "cover" | "contain" | "fill"
      transform: resolvedMirrored ? "scaleX(-1)" : "none",
    };

    return (
      <div className={className} style={containerStyle}>
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          controls={false}
          style={videoStyle}
        />
      </div>
    );
  }
);

export default CameraStream;
