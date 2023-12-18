import _ from 'lodash';
import React from 'react';
import {View} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import Text from './Text';
import UserDetailsTooltip from './UserDetailsTooltip';

type ReportWelcomeTextOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type ReportWelcomeTextProps = ReportWelcomeTextOnyxProps & {
    /** The report currently being looked at */
    report: Report;

    /** The policy for the current route */
    policy: Policy;
};

function ReportWelcomeText({report = {} as Report, policy = {} as Policy, personalDetails = {}}: ReportWelcomeTextProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    const isChatRoom = ReportUtils.isChatRoom(report);
    const isDefault = !(isChatRoom || isPolicyExpenseChat);
    const participantAccountIDs = report?.participantAccountIDs ?? [];
    const isMultipleParticipant = participantAccountIDs.length > 1;
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(
        // TODO: Remove type assertion (`as PersonalDetailsList`) after `src/libs/OptionsListUtils.js` is migrated into ts
        OptionsListUtils.getPersonalDetailsForAccountIDs(participantAccountIDs, personalDetails) as PersonalDetailsList,
        isMultipleParticipant,
    );
    const isUserPolicyAdmin = PolicyUtils.isPolicyAdmin(policy);
    const roomWelcomeMessage = ReportUtils.getRoomWelcomeMessage(report, isUserPolicyAdmin);
    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, participantAccountIDs);

    return (
        <>
            <View>
                <Text style={[styles.textHero]}>
                    {isChatRoom ? translate('reportActionsView.welcomeToRoom', {roomName: ReportUtils.getReportName(report)}) : translate('reportActionsView.sayHello')}
                </Text>
            </View>
            <Text style={[styles.mt3, styles.mw100]}>
                {isPolicyExpenseChat && (
                    <>
                        <Text>{translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartOne')}</Text>
                        <Text style={[styles.textStrong]}>{ReportUtils.getDisplayNameForParticipant(report.ownerAccountID)}</Text>
                        <Text>{translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartTwo')}</Text>
                        <Text style={[styles.textStrong]}>{ReportUtils.getPolicyName(report)}</Text>
                        <Text>{translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartThree')}</Text>
                    </>
                )}
                {isChatRoom && (
                    <>
                        <Text>{roomWelcomeMessage.phrase1}</Text>
                        {roomWelcomeMessage.showReportName && (
                            <Text
                                style={[styles.textStrong]}
                                onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID))}
                                suppressHighlighting
                            >
                                {ReportUtils.getReportName(report)}
                            </Text>
                        )}
                        {roomWelcomeMessage.phrase2 !== undefined && <Text>{roomWelcomeMessage.phrase2}</Text>}
                    </>
                )}
                {isDefault && (
                    <Text>
                        <Text>{translate('reportActionsView.beginningOfChatHistory')}</Text>
                        {displayNamesWithTooltips.map(({displayName, pronouns, accountID}, index) => (
                            <Text key={`${displayName}${pronouns}${accountID}`}>
                                <UserDetailsTooltip accountID={accountID}>
                                    {ReportUtils.isOptimisticPersonalDetail(accountID) ? (
                                        <Text style={[styles.textStrong]}>{displayName}</Text>
                                    ) : (
                                        <Text
                                            style={[styles.textStrong]}
                                            onPress={() => Navigation.navigate(ROUTES.PROFILE.getRoute(accountID))}
                                            suppressHighlighting
                                        >
                                            {displayName}
                                        </Text>
                                    )}
                                </UserDetailsTooltip>
                                {!_.isEmpty(pronouns) && <Text>{` (${pronouns})`}</Text>}
                                {index === displayNamesWithTooltips.length - 1 && <Text>.</Text>}
                                {index === displayNamesWithTooltips.length - 2 && <Text>{` ${translate('common.and')} `}</Text>}
                                {index < displayNamesWithTooltips.length - 2 && <Text>, </Text>}
                            </Text>
                        ))}
                    </Text>
                )}
                {(moneyRequestOptions.includes(CONST.IOU.TYPE.SEND) || moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)) && <Text>{translate('reportActionsView.usePlusButton')}</Text>}
            </Text>
        </>
    );
}

ReportWelcomeText.displayName = 'ReportWelcomeText';

export default withOnyx<ReportWelcomeTextProps, ReportWelcomeTextOnyxProps>({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(ReportWelcomeText);
