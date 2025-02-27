import React, { useState, useCallback, ReactElement } from 'react';
import { ButtonVariant } from '@metamask/snaps-sdk';
import {
  Box,
  Button,
  Icon,
  IconName,
  IconSize,
  Text,
} from '../../../components/component-library';
import {
  AlignItems,
  Display,
  FlexDirection,
  IconColor,
  JustifyContent,
} from '../../../helpers/constants/design-system';
import { trace } from '../../../../shared/lib/trace';
import { useI18nContext } from '../../../hooks/useI18nContext';

export function SentryTest() {
  return (
    <>
      <Text className="settings-page__security-tab-sub-header__bold">
        Sentry
      </Text>
      <div className="settings-page__content-padded">
        <GenerateUIError />
        <GenerateBackgroundError />
        <GenerateTrace />
      </div>
    </>
  );
}

function GenerateUIError() {
  const t = useI18nContext();

  const handleClick = useCallback(async () => {
    await window.stateHooks.throwTestError?.('Developer Options');
  }, []);

  return (
    <TestButton
      name={t('developerOptionsSentryButtonGenerateUIError')}
      description={t('developerOptionsSentryDescriptionGenerateUIError', [
        <b>TestError</b>,
      ])}
      onClick={handleClick}
      expectError
    />
  );
}

function GenerateBackgroundError() {
  const t = useI18nContext();

  const handleClick = useCallback(async () => {
    await window.stateHooks.throwTestBackgroundError?.('Developer Options');
  }, []);

  return (
    <TestButton
      name={t('developerOptionsSentryButtonGenerateBackgroundError')}
      description={t(
        'developerOptionsSentryDescriptionGenerateBackgroundError',
        [<b>TestError</b>],
      )}
      onClick={handleClick}
      expectError
    />
  );
}

function GenerateTrace() {
  const t = useI18nContext();

  const handleClick = useCallback(async () => {
    await trace(
      {
        name: 'Developer Test',
        data: { 'test.data.number': 123 },
        tags: { 'test.tag.number': 123 },
      },
      async (context) => {
        await trace(
          {
            name: 'Nested Test 1',
            data: { 'test.data.boolean': true },
            tags: { 'test.tag.boolean': true },
            parentContext: context,
          },
          () => sleep(1000),
        );

        await trace(
          {
            name: 'Nested Test 2',
            data: { 'test.data.string': 'test' },
            tags: { 'test.tag.string': 'test' },
            parentContext: context,
          },
          () => sleep(500),
        );
      },
    );
  }, []);

  return (
    <TestButton
      name={t('developerOptionsSentryButtonGenerateTrace')}
      description={t('developerOptionsSentryDescriptionGenerateTrace', [
        <b>Developer Test</b>,
      ])}
      onClick={handleClick}
    />
  );
}

function TestButton({
  name,
  description,
  onClick,
  expectError,
}: {
  name: string;
  description: ReactElement;
  onClick: () => Promise<void>;
  expectError?: boolean;
}) {
  const [isComplete, setIsComplete] = useState(false);

  const handleClick = useCallback(async () => {
    let hasError = false;

    try {
      await onClick();
    } catch (error) {
      hasError = true;
      throw error;
    } finally {
      if (expectError || !hasError) {
        setIsComplete(true);
      }
    }
  }, [onClick]);

  return (
    <Box
      className="settings-page__content-row"
      display={Display.Flex}
      flexDirection={FlexDirection.Row}
      justifyContent={JustifyContent.spaceBetween}
      gap={4}
    >
      <div className="settings-page__content-item">
        <div className="settings-page__content-description">{description}</div>
      </div>
      <div className="settings-page__content-item-col">
        <Button variant={ButtonVariant.Primary} onClick={handleClick}>
          {name}
        </Button>
      </div>
      <div className="settings-page__content-item-col">
        <Box
          display={Display.Flex}
          alignItems={AlignItems.center}
          paddingLeft={2}
          paddingRight={2}
          style={{ height: '40px', width: '40px' }}
        >
          <Icon
            className="settings-page-developer-options__icon-check"
            name={IconName.Check}
            color={IconColor.successDefault}
            size={IconSize.Lg}
            hidden={!isComplete}
          />
        </Box>
      </div>
    </Box>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
