import type { Command } from '@/classes/command.ts';
import type { Event } from '@/classes/event.ts';
import type { ChatInputCommandInteraction, ClientEvents, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import type { Add } from 'ts-arithmetic';

export type MaybePromise<Type> = Type | Promise<Type>;
export type Categories = keyof ClientEvents;
export type slashCommandData = | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'> | SlashCommandSubcommandsOnlyBuilder
export type ReplacerValue = string | number;

export type CommandImport = {
  default: Command
}

export type EventImport = {
  default: Event
}

export interface EventData<Category extends Categories> {
    category: Category;
    once?: boolean;
    disabled?: boolean;
    execute: (...args: ClientEvents[Category]) => MaybePromise<any>;
}

export interface CommandData {
  disabled?: boolean;
  cooldown?: number;
  data: (builder: slashCommandData) => slashCommandData;
  execute: (interaction: ChatInputCommandInteraction) => MaybePromise<any>;
}

export type Replace<
  Format extends string,
  Values extends ReplacerValue[],
  Index extends number = 0,
> = Values[Index] extends string | number
  ? Format extends `${infer Before}{${Index}}${infer After}`
    ? Replace<`${Before}${Values[Index]}${After}`, Values, Add<Index, 1>>
    : Format
  : Format;