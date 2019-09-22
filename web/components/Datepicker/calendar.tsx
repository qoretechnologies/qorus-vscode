/* @flow */
import React, { Component } from 'react';
import moment from 'moment';
import { toArray } from 'lodash';
import pure from 'recompose/onlyUpdateForKeys';
import { Icon } from '@blueprintjs/core';

const chunk = (arr: Array<Object>, unit: number): Array<any> => {
    const res: Object = {};

    arr.forEach((k, index) => {
        const v: number = Math.floor(parseInt(index, 10) / unit);

        if (res[v]) {
            res[v].push(k);
        } else {
            res[v] = [k];
        }
    });

    return toArray(res);
};

@pure(['date', 'activeDate'])
export default class Calendar extends Component {
    props: {
        date: Object;
        setDate: (date: Object) => void;
        activeDate: Object;
        setActiveDate: () => void;
        futureOnly: boolean;
    } = this.props;

    getDaysOfMonth(): Array<Object> {
        const month: number = this.props.date.month();
        const year: number = this.props.date.year();
        const start: Object = moment([year, month]).startOf('isoweek');
        const end: Object = start
            .clone()
            .add(5, 'weeks')
            .add(-1, 'days');
        const days: Array<Object> = [];
        const date: Object = this.props.date;
        const activeDate: Object = this.props.activeDate;

        while (start.valueOf() <= end.valueOf()) {
            const dDate: Object = moment(start)
                .hours(date.hours())
                .minutes(date.minutes())
                .seconds(date.seconds());
            const day: Object = {
                date: dDate,
                day: start.date(),
                month: start.month(),
                year: start.year(),
                css: '',
            };

            if (start.valueOf() === moment([moment().year(), moment().month(), moment().date()]).valueOf()) {
                day.is_today = true;
            }
            if (start.valueOf() === moment([activeDate.year(), activeDate.month(), activeDate.date()]).valueOf()) {
                day.active = true;
            }

            if (start.month() < month) day.css = 'old';
            if (start.month() > month) day.css = 'new';

            if (
                this.props.futureOnly &&
                start.valueOf() < moment([moment().year(), moment().month(), moment().date()]).valueOf()
            ) {
                day.css = 'disabled';
            }
            if (day.is_today) day.css += ' today';
            if (day.active) day.css += ' active';

            days.push(day);
            start.add(1, 'days');
        }

        return days;
    }

    setDate: Function = (date: Object): void => {
        this.props.setDate(date);
    };

    setActiveDate: Function = (date: Object): void => {
        this.props.setActiveDate(date);
    };

    nextMonth: Function = (): void => {
        const date: Object = moment(this.props.date);
        this.setDate(date.add(1, 'months'));
    };

    prevMonth: Function = (): void => {
        const date: Object = moment(this.props.date);
        this.setDate(date.add(-1, 'months'));
    };

    renderYearAndMonth: Function = (): string => `${this.props.date.format('MMM')} ${this.props.date.year()}`;

    renderRows: Function = () => {
        const weeks: Array<Object> = chunk(this.getDaysOfMonth(), 7);

        return weeks.reduce((wks, week, key) => {
            const days: Array<number> = week.reduce(
                (ds, day, idx) => [
                    ...ds,
                    <td className={day.css} key={idx} onClick={() => this.setActiveDate(day.date)}>
                        {day.day}
                    </td>,
                ],
                []
            );

            return [...wks, <tr key={key}>{days}</tr>];
        }, []);
    };

    render() {
        return (
            <table className="table table-condensed">
                <thead>
                    <tr>
                        <th className="month" onClick={this.prevMonth}>
                            <Icon icon="chevron-left" />
                        </th>
                        <th colSpan={5}>{this.renderYearAndMonth()}</th>
                        <th className="month" onClick={this.nextMonth}>
                            <Icon icon="chevron-right" />
                        </th>
                    </tr>
                    <tr>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                        <th>Sun</th>
                    </tr>
                </thead>
                <tbody>{this.renderRows()}</tbody>
            </table>
        );
    }
}
