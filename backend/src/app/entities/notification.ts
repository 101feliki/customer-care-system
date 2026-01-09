/* eslint-disable prettier/prettier */
import { randomUUID } from 'crypto';
import { Replace } from '../../helpers/Replace';
import { Content } from './content';

export interface NotificationProps {
  recipientId: string;
  content: Content;
  category: string;
  readAt?: Date | null;
  canceledAt?: Date | null;
  createdAt: Date;
  channel: string; // Required
  status?: string;
  bulkNotificationId?: string |null;
  updatedAt?: Date;
}

export class Notification {
  private _id: string;
  private props: NotificationProps;

  // FIX: Make channel required in Replace type too
  constructor(
    props: Replace<NotificationProps, { createdAt?: Date; channel?: string }>, // Add channel here
    id?: string
  ) {
    this._id = id ?? randomUUID();
    this.props = {
      ...props,
      // Ensure required fields have defaults
      channel: props.channel || 'email', // This is now safe
      status: props.status || 'pending',
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  public get id(): string {
    return this._id;
  }

  public get recipientId(): string {
    return this.props.recipientId;
  }

  public set recipientId(recipientId: string) {
    this.props.recipientId = recipientId;
    this.props.updatedAt = new Date();
  }
  
  public get channel(): string {
    return this.props.channel;
  }

  public set channel(channel: string) {
    this.props.channel = channel;
    this.props.updatedAt = new Date();
  }

  public get status(): string {
    return this.props.status || 'pending';
  }

  public set status(status: string) {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  public get content(): Content {
    return this.props.content;
  }

  public set content(content: Content) {
    this.props.content = content;
    this.props.updatedAt = new Date();
  }

  public get category(): string {
    return this.props.category;
  }

  public set category(category: string) {
    this.props.category = category;
    this.props.updatedAt = new Date();
  }

  public get readAt(): Date | null | undefined {
    return this.props.readAt;
  }

  public read() {
    this.props.readAt = new Date();
    this.props.updatedAt = new Date();
  }

  public unread() {
    this.props.readAt = null;
    this.props.updatedAt = new Date();
  }

  public get canceledAt(): Date | null | undefined {
    return this.props.canceledAt;
  }

  public get bulkNotificationId(): string |null| undefined {
    return this.props.bulkNotificationId;
  }

  public set bulkNotificationId(id: string |null| undefined) {
    this.props.bulkNotificationId = id;
    this.props.updatedAt = new Date();
  }

  public cancel(): void {
    this.props.canceledAt = new Date();
    this.props.updatedAt = new Date();
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt || new Date();
  }

  public set updatedAt(date: Date) {
    this.props.updatedAt = date;
  }
}