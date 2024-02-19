import React from "react";
import { useState, useEffect } from '@wordpress/element';
import { __ } from "@wordpress/i18n";

const CountDownOne = ({ attributes }) => {
    const { discountText, startDate, endDate } = attributes;
    const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining());
        }, 1000);

        return () => clearInterval(timer);
    }, [startDate, endDate,discountText]);

    function calculateTimeRemaining() {
        const now = new Date();
        const start = new Date(startDate + "T00:00:00");
        const end = new Date(endDate + "T23:59:59");

        let diff, statuss;

        if (start > now) {
            diff = start - now;
            statuss = "Starts In";
        } else {
            diff = end - now;
            statuss = `${discountText}`;
        }

        if (diff <= 0) {
            return { days: "00", hours: "00", minutes: "00", seconds: "00", status };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return {
            days: formatTime(days),
            hours: formatTime(hours),
            minutes: formatTime(minutes),
            seconds: formatTime(seconds),
            statuss,
        };
    }

    function formatTime(time) {
        return time.toString().padStart(2, "0");
    }

    const { days, hours, minutes, seconds, statuss } = timeRemaining;
    return (
        <div
            className="sgsb-countdown-timer ct-layout-1"
            style={{
                margin: "0 auto",
                padding: "16px 40px 14px",
                borderRadius: 8,
                border: `1px solid ${attributes?.borderColor}`,
                background: `${attributes?.backgroundColor}`,
            }}
        >
            <div
                className="sgsb-countdown-timer-wrapper"
                style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                }}
            >
                <p
                    className="sgsb-countdown-timer-heading ct-layout-1"
                    style={{
                        color: `${attributes?.headingColor}`,
                        margin: "0 0 10px 0",
                        fontSize: 40,
                        textAlign: "center",
                        fontWeight: 600,
                        lineHeight: 1.2,
                    }}
                >
                    {__(`${statuss}`, "storegrowth-sales-booster")}
                </p>
                <div
                    data-end-date="2023-10-10 23:59:59"
                    className="sgsb-countdown-timer-items ct-layout-1"
                    style={{
                        display: "flex",
                        marginBottom: 10,
                        justifyContent: "center",
                    }}
                >
                    <div
                        className="sgsb-countdown-timer-item ct-layout-1"
                        style={{
                            color: "#989FAB",
                            width: 64,
                            height: 64,
                            border: "1px solid #ECEDF0",
                            padding: "14px 0",
                            fontSize: 12,
                            textAlign: "center",
                            borderRadius: 8,
                            letterSpacing: 2,
                            textTransform: "uppercase",
                        }}
                    >
                        <strong
                            className="sgsb-countdown-timer-item-days"
                            style={{
                                color: "#1B1B50",
                                display: "block",
                                fontSize: 24,
                                lineHeight: 0.75,
                                fontWeight: 500,
                            }}
                        >
                            {__(`${days}`, "storegrowth-sales-booster")}
                        </strong>
                        <span>{__("Days", "storegrowth-sales-booster")}</span>
                    </div>
                    <span
                        className="sgsb-colon ct-layout-1"
                        style={{
                            color: "#008DFF",
                            margin: "0 14px",
                            lineHeight: 4,
                        }}
                    >
                        :
                    </span>
                    <div
                        className="sgsb-countdown-timer-item ct-layout-1"
                        style={{
                            width: 64,
                            color: "#989FAB",
                            height: 64,
                            border: "1px solid #ECEDF0",
                            padding: "14px 0",
                            fontSize: 12,
                            textAlign: "center",
                            borderRadius: 8,
                            letterSpacing: 2,
                            textTransform: "uppercase",
                        }}
                    >
                        <strong
                            className="sgsb-countdown-timer-item-hours"
                            style={{
                                color: "#1B1B50",
                                display: "block",
                                fontSize: 24,
                                lineHeight: 0.75,
                                fontWeight: 500,
                            }}
                        >
                            {__(`${hours}`, "storegrowth-sales-booster")}
                        </strong>
                        <span>{__("Hours", "storegrowth-sales-booster")}</span>
                    </div>
                    <span
                        className="sgsb-colon ct-layout-1"
                        style={{
                            color: "#008DFF",
                            margin: "0 14px",
                            lineHeight: 4,
                        }}
                    >
                        :
                    </span>
                    <div
                        className="sgsb-countdown-timer-item ct-layout-1"
                        style={{
                            width: 64,
                            color: "#989FAB",
                            height: 64,
                            border: "1px solid #ECEDF0",
                            padding: "14px 0",
                            fontSize: 12,
                            textAlign: "center",
                            borderRadius: 8,
                            letterSpacing: 2,
                            textTransform: "uppercase",
                        }}
                    >
                        <strong
                            className="sgsb-countdown-timer-item-minutes"
                            style={{
                                color: "#1B1B50",
                                display: "block",
                                fontSize: 24,
                                lineHeight: 0.75,
                                fontWeight: 500,
                            }}
                        >
                            {__(`${minutes}`, "storegrowth-sales-booster")}
                        </strong>
                        <span>{__("Min", "storegrowth-sales-booster")}</span>
                    </div>
                    <span
                        className="sgsb-colon ct-layout-1"
                        style={{
                            color: "#008DFF",
                            margin: "0 14px",
                            lineHeight: 4,
                        }}
                    >
                        :
                    </span>
                    <div
                        className="sgsb-countdown-timer-item ct-layout-1"
                        style={{
                            width: 64,
                            color: "#989FAB",
                            height: 64,
                            border: "1px solid #ECEDF0",
                            padding: "14px 0",
                            fontSize: 12,
                            textAlign: "center",
                            borderRadius: 8,
                            letterSpacing: 2,
                            textTransform: "uppercase",
                        }}
                    >
                        <strong
                            className="sgsb-countdown-timer-item-seconds"
                            style={{
                                color: "#1B1B50",
                                display: "block",
                                fontSize: 24,
                                lineHeight: 0.75,
                                fontWeight: 500,
                            }}
                        >
                            {__(`${seconds}`, "storegrowth-sales-booster")}
                        </strong>
                        <span>{__("Sec", "storegrowth-sales-booster")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountDownOne;
