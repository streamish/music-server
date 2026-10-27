import { LibraryTrackDto } from 'src/library/dtos/library.track.dto';
import { SmartPlaylistFieldEnum, SmartPlaylistIntervalTagEnum, SmartPlaylistOperationEnum } from 'src/types/enums';
import type { SmartPlaylistRule } from 'src/playlists/types';

type RuleLike = Pick<SmartPlaylistRule, 'field' | 'operation' | 'value' | 'interval'>;

/**
 * Gets the values of a track field, as multiple values are possible for associations like artists.
 */
function getTrackFieldValues(track: LibraryTrackDto, field: SmartPlaylistFieldEnum): (string | number)[] {
  switch (field) {
    case SmartPlaylistFieldEnum.ALBUM:
      return [track.albumTitle];
    case SmartPlaylistFieldEnum.ALBUM_ARTIST:
      return track.albumArtists.map((item) => item.name);
    case SmartPlaylistFieldEnum.ARTIST:
      return track.artists.map((item) => item.name);
    case SmartPlaylistFieldEnum.BIT_RATE:
      return [track.fileBitRate];
    case SmartPlaylistFieldEnum.COMPOSER:
      return track.composers.map((item) => item.name);
    case SmartPlaylistFieldEnum.FILE_PATH:
      return [track.filePath];
    case SmartPlaylistFieldEnum.GENRE:
      return track.genres.map((item) => item.name);
    case SmartPlaylistFieldEnum.RATING:
      return [track.rating || 0];
    case SmartPlaylistFieldEnum.YEAR:
      return [track.year];
    default:
      return [];
  }
}

function matchesValue(trackValue: string | number, operation: SmartPlaylistOperationEnum, ruleValue: string) {
  if (typeof trackValue === 'number') {
    const numericRuleValue = Number(ruleValue);
    if (ruleValue.trim() === '' || Number.isNaN(numericRuleValue)) {
      return false;
    }
    switch (operation) {
      case SmartPlaylistOperationEnum.IS:
        return trackValue === numericRuleValue;
      case SmartPlaylistOperationEnum.IS_NOT:
        return trackValue !== numericRuleValue;
      case SmartPlaylistOperationEnum.LESS_THAN:
        return trackValue < numericRuleValue;
      case SmartPlaylistOperationEnum.GREATER_THAN_OR_EQUAL_TO:
        return trackValue >= numericRuleValue;
      default:
        return false;
    }
  }
  const left = trackValue.toLowerCase();
  const right = ruleValue.toLowerCase();
  switch (operation) {
    case SmartPlaylistOperationEnum.IS:
    case SmartPlaylistOperationEnum.IS_NOT:
      return left === right;
    case SmartPlaylistOperationEnum.CONTAINS:
    case SmartPlaylistOperationEnum.DOES_NOT_CONTAIN:
      return left.includes(right);
    default:
      return false;
  }
}

/**
 * Evaluates a non-date rule against a track.  Negative operations match only if no value of the field matches
 * the positive form of the operation.
 */
export function trackMatchesRule(track: LibraryTrackDto, rule: RuleLike) {
  const values = getTrackFieldValues(track, rule.field);
  switch (rule.operation) {
    case SmartPlaylistOperationEnum.IS_NOT:
      return !values.some((value) => matchesValue(value, SmartPlaylistOperationEnum.IS, rule.value));
    case SmartPlaylistOperationEnum.DOES_NOT_CONTAIN:
      return !values.some((value) => matchesValue(value, SmartPlaylistOperationEnum.CONTAINS, rule.value));
    default:
      return values.some((value) => matchesValue(value, rule.operation, rule.value));
  }
}

/**
 * Converts a date-added rule to the library `addedAfter` / `addedBefore` track filter.
 * @param rule The date-added rule
 * @param now The reference time for relative operations
 * @returns The filter, or undefined if the rule value or operation is invalid
 */
export function getDateAddedFilter(
  rule: RuleLike,
  now = new Date(),
): { addedAfter?: Date; addedBefore?: Date } | undefined {
  switch (rule.operation) {
    case SmartPlaylistOperationEnum.AFTER:
    case SmartPlaylistOperationEnum.BEFORE: {
      const date = new Date(rule.value);
      if (Number.isNaN(date.getTime())) {
        return undefined;
      }
      return rule.operation === SmartPlaylistOperationEnum.AFTER ? { addedAfter: date } : { addedBefore: date };
    }
    case SmartPlaylistOperationEnum.IN_THE_LAST:
    case SmartPlaylistOperationEnum.NOT_IN_THE_LAST: {
      const amount = Number(rule.value);
      if (!rule.interval || rule.value.trim() === '' || !Number.isFinite(amount) || amount < 0) {
        return undefined;
      }
      const cutoff = new Date(now);
      switch (rule.interval) {
        case SmartPlaylistIntervalTagEnum.DAYS:
          cutoff.setDate(cutoff.getDate() - amount);
          break;
        case SmartPlaylistIntervalTagEnum.WEEKS:
          cutoff.setDate(cutoff.getDate() - amount * 7);
          break;
        case SmartPlaylistIntervalTagEnum.MONTHS:
          cutoff.setMonth(cutoff.getMonth() - amount);
          break;
        default:
          return undefined;
      }
      return rule.operation === SmartPlaylistOperationEnum.IN_THE_LAST
        ? { addedAfter: cutoff }
        : { addedBefore: cutoff };
    }
    default:
      return undefined;
  }
}
