import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'lodash';
import lodashGet from 'lodash/get';
import FullName from './substeps/FullName';
import DateOfBirth from './substeps/DateOfBirth';
import SocialSecurityNumber from './substeps/SocialSecurityNumber';
import Address from './substeps/Address';
import Confirmation from './substeps/Confirmation';
import useSubStep from '../../../hooks/useSubStep';
import ONYXKEYS from '../../../ONYXKEYS';
import {reimbursementAccountPropTypes} from '../reimbursementAccountPropTypes';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import InteractiveStepSubHeader from '../../../components/InteractiveStepSubHeader';
import useLocalize from '../../../hooks/useLocalize';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import * as BankAccounts from '../../../libs/actions/BankAccounts';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import getInitialSubstepForPersonalInfo from '../utils/getInitialSubstepForPersonalInfo';
import reimbursementAccountDraftPropTypes from '../ReimbursementAccountDraftPropTypes';
import * as ReimbursementAccountProps from '../reimbursementAccountPropTypes';
import ScreenWrapper from '../../../components/ScreenWrapper';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

const STEPS_HEADER_HEIGHT = 40;
// TODO Will most likely come from different place
const STEP_NAMES = ['1', '2', '3', '4', '5'];

const bodyContent = [FullName, DateOfBirth, SocialSecurityNumber, Address, Confirmation];

function PersonalInfo({reimbursementAccount, reimbursementAccountDraft}) {
    const {translate} = useLocalize();

    const submit = useCallback(() => {
        const values = {
            [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.FIRST_NAME]: lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.FIRST_NAME, ''),
            [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.LAST_NAME]: lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.LAST_NAME, ''),
            [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.DOB]: lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.DOB, ''),
            [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.SSN_LAST_4]: lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.SSN_LAST_4, ''),
            [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STREET]: lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STREET, ''),
            [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.CITY]: lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.CITY, ''),
            [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STATE]: lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STATE, ''),
            [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.ZIP_CODE]: lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.ZIP_CODE, ''),
        };

        const payload = {
            bankAccountID: _.get(reimbursementAccount, 'achData.bankAccountID', 0),
            ...values,
        };

        BankAccounts.updatePersonalInformationForBankAccount(payload);
    }, [reimbursementAccount, reimbursementAccountDraft]);
    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(reimbursementAccountDraft), [reimbursementAccountDraft]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            Navigation.goBack(ROUTES.HOME);
        } else {
            prevScreen();
        }
    };

    return (
        <ScreenWrapper
            testID={PersonalInfo.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                onBackButtonPress={handleBackButtonPress}
                title={translate('personalInfoStep.personalInfo')}
            />
            <View style={[styles.ph5, styles.mv3, {height: STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    onStepSelected={() => {}}
                    // TODO Will be replaced with proper values
                    startStep={1}
                    stepNames={STEP_NAMES}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

PersonalInfo.propTypes = propTypes;
PersonalInfo.defaultProps = defaultProps;
PersonalInfo.displayName = 'PersonalInfo';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(PersonalInfo);
